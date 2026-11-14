// Ties everything together: app state, accounts, the turn clock, bots,
// online rooms and button handlers.

const storage = {
  read(key, fallback) {
    try {
      const value = localStorage.getItem('rondo:' + key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem('rondo:' + key, JSON.stringify(value));
    } catch (error) {
      // Storage can be blocked. The game works without it.
    }
  },
};

const MAX_SEATS = 8;
const MAX_NAME_LENGTH = 14;

const state = {
  screen: 'welcome',         // welcome, home, profile, setup, online, lobby, game, leaderboard or highscores
  mode: null,                // local, solo or online
  user: null,                // { id, name, isGuest, photo }
  profileDraft: null,        // { name, photo } while the profile is being edited
  guestName: storage.read('guest-name', ''),
  game: null,
  seats: [],                 // seats being set up for a local game
  settings: storage.read('settings', { seconds: 15, lives: 3 }),
  room: null,                // { code, hostId, settings, version, players, stopWatching }
  database: null,            // set once Firebase has started
  stats: null,               // all-time results, null while loading
  busy: false,
  canAnswer: false,
  feedback: null,            // { text, isError, trustText }
  error: '',
};

const view = document.querySelector('#view');
const accountBar = document.querySelector('#account');


// ---- Accounts ----

function playAsGuest(name) {
  const guestName = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!guestName) {
    state.error = 'Enter your name first.';
    render();
    return;
  }
  storage.write('guest-name', guestName);
  state.guestName = guestName;
  state.user = {
    id: 'guest-' + Math.random().toString(36).slice(2, 10),
    name: guestName,
    isGuest: true,
    photo: storage.read('guest-photo', ''),
  };
  show('home');
}

// Runs whenever Firebase reports someone signing in or out.
function onAccountChange(account) {
  if (account && account.isGuest) {
    // A guest who went online now has a Firebase identity.
    if (state.user && state.user.isGuest) state.user.id = account.id;
    return;
  }

  if (account) {
    const sameAccount = state.user && state.user.id === account.id;
    state.user = sameAccount ? { ...account, photo: state.user.photo } : account;
    if (state.screen === 'welcome') show('home');
    else render();
    if (!sameAccount) loadSavedPhoto(account.id);
    return;
  }

  const wasSignedIn = state.user && !state.user.isGuest;
  if (wasSignedIn) {
    leaveRoom();
    state.user = null;
    state.game = null;
    show('welcome');
  }
}

// A picture chosen on the profile screen replaces the one from Google.
async function loadSavedPhoto(accountId) {
  try {
    const profile = await Stats.loadProfile(state.database, accountId);
    const stillSignedIn = state.user && state.user.id === accountId;
    if (profile && typeof profile.photo === 'string' && stillSignedIn) {
      state.user.photo = profile.photo;
      render();
    }
  } catch (error) {
    console.error(error);
  }
}

async function signIn(method) {
  state.error = '';
  try {
    await method();
    // Picks up a name set just after a new account was created.
    onAccountChange(Auth.currentUser());
  } catch (error) {
    state.error = Auth.errorMessage(error);
    render();
  }
}

function submitEmailForm(form, intent) {
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  const name = form.querySelector('#account-name').value.trim().slice(0, MAX_NAME_LENGTH);

  if (intent === 'sign-in') {
    signIn(() => Auth.signInWithEmail(email, password));
  } else if (!name) {
    state.error = 'Enter a name for your new account.';
    render();
  } else {
    signIn(() => Auth.createAccount(name, email, password));
  }
}

function editProfile() {
  state.profileDraft = { name: state.user.name, photo: state.user.photo };
  show('profile');
}

async function choosePhoto(file) {
  if (!file) return;
  try {
    state.profileDraft.photo = await Avatar.fromFile(file);
    state.error = '';
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function saveProfile() {
  const name = state.profileDraft.name.trim().slice(0, MAX_NAME_LENGTH);
  const photo = state.profileDraft.photo;
  if (!name) {
    state.error = 'Enter a name.';
    render();
    return;
  }

  if (state.user.isGuest) {
    storage.write('guest-name', name);
    storage.write('guest-photo', photo);
    state.guestName = name;
  } else {
    state.busy = true;
    render();
    try {
      await Auth.updateName(name);
      await Stats.saveProfile(state.database, state.user.id, { name, photo });
    } catch (error) {
      console.error(error);
      state.busy = false;
      state.error = 'Could not save your profile. Check your connection.';
      render();
      return;
    }
    state.busy = false;
  }

  state.user.name = name;
  state.user.photo = photo;
  show('home');
}

async function leaveAccount() {
  leaveRoom();
  state.game = null;
  state.user = null;
  await Auth.signOut();
  show('welcome');
}


// ---- Saving game state ----

function isOnline() {
  return state.mode === 'online';
}

function roomDocument() {
  return state.database.doc('rooms/' + state.room.code);
}

function showNetworkError(error) {
  console.error(error);
  state.error = 'Could not reach the room. Check your connection.';
  state.busy = false;
  render();
}

// Replace the game with a new version.
function save(game) {
  const previous = state.game ? state.game.version : state.room ? state.room.version : 0;
  const justFinished = game.status === 'over' && (!state.game || state.game.status === 'playing');
  game.version = previous + 1;
  state.game = game;
  state.feedback = null;

  if (isOnline()) {
    roomDocument().set({ ...game, hostId: state.room.hostId }).catch(showNetworkError);
  }
  // Whichever device ends the game records it, so it is counted once.
  if (justFinished) Stats.record(game, state.database).catch(console.error);
  render();
}

function isMyTurn(game) {
  if (!game || game.status !== 'playing') return false;
  const seat = game.seats[game.turn];
  return isOnline() ? seat.id === state.user.id : !seat.isBot;
}


// ---- Answering ----

const REJECTIONS = {
  used: 'That has already been said. Try another.',
  unknown: 'That is not in the records.',
};

function submitAnswer(text) {
  const game = state.game;
  if (!isMyTurn(game) || !text.trim()) return;

  const result = Referee.check(game, text);
  if (result.ok) {
    save(Game.acceptAnswer(game, result.answer));
    return;
  }

  // The records do not hold every player, so an unknown answer can be
  // counted on the players' word.
  state.feedback = { text: REJECTIONS[result.reason], isError: true };
  if (result.reason === 'unknown') state.feedback.trustText = text;
  render();
  document.querySelector('#answer').select();
}

function trustAnswer() {
  const text = state.feedback && state.feedback.trustText;
  if (!text || !isMyTurn(state.game)) return;
  save(Game.acceptAnswer(state.game, Referee.trust(state.game, text)));
}


// ---- Turn clock ----
// Every device runs its own countdown, restarted whenever the turn
// changes. The device whose turn it is decides when time is up.

const LOW_TIME = 5000;
const clock = { turn: '', endsAt: 0, done: false };

function turnKey(game) {
  return game.id + ':' + game.turnNumber;
}

function syncClock(game) {
  if (turnKey(game) === clock.turn) return;
  clock.turn = turnKey(game);
  clock.endsAt = Date.now() + game.settings.seconds * 1000;
  clock.done = false;
}

function timeRemaining() {
  return clock.endsAt - Date.now();
}

function drawClock(game) {
  const bar = document.querySelector('#timer-bar');
  const text = document.querySelector('#timer-text');
  if (!bar || !text) return;

  const remaining = Math.max(0, timeRemaining());
  bar.style.width = (100 * remaining) / (game.settings.seconds * 1000) + '%';
  bar.classList.toggle('low', remaining < LOW_TIME);
  text.textContent = Math.ceil(remaining / 1000) + 's';
}

// In an online game, how long this device waits past the end of someone
// else's turn before ending it for them. Covers a player who has left.
function takeoverDelay(game) {
  if (game.seats[Game.nextSeatAlive(game)].id === state.user.id) return 6000;
  if (state.room.hostId === state.user.id) return 12000;
  return null;
}

function tick() {
  const game = state.game;
  if (state.screen !== 'game' || !game || game.status !== 'playing') return;

  drawClock(game);
  if (clock.done) return;

  let timeIsUp = timeRemaining() <= 0;
  if (!isMyTurn(game)) {
    const delay = isOnline() ? takeoverDelay(game) : null;
    timeIsUp = delay !== null && -timeRemaining() > delay;
  }
  if (timeIsUp) {
    clock.done = true;
    save(Game.miss(game, 'time'));
  }
}

setInterval(tick, 100);


// ---- Bots ----

const BOT_BLANK_CHANCE = 0.08;
let botTurn = '';

function botMove(game) {
  const answers = Game.possibleAnswers(game);
  if (!answers.length || Math.random() < BOT_BLANK_CHANCE) {
    save(Game.miss(game, 'blank'));
    return;
  }
  // Favour names near the top of the list, which are the best known.
  // An opening name comes from the top 120 only.
  const pool = game.link ? answers.length : Math.min(answers.length, 120);
  const pick = answers[Math.floor(Math.min(Math.random(), Math.random()) * pool)];
  save(Game.acceptAnswer(game, { type: pick.type, name: pick.name, key: pick.key }));
}

function scheduleBot() {
  const game = state.game;
  if (isOnline() || !game.seats[game.turn].isBot || turnKey(game) === botTurn) return;

  const turn = turnKey(game);
  botTurn = turn;
  const thinkingTime = 1300 + Math.random() * 2300;

  setTimeout(() => {
    const current = state.game;
    const sameTurn = current && turnKey(current) === turn;
    if (sameTurn && state.screen === 'game' && current.status === 'playing') botMove(current);
  }, thinkingTime);
}


// ---- Online rooms ----
// A room is one database document holding the game, plus a "players"
// collection that people add themselves to while in the lobby.

const ROOM_CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_LETTERS[Math.floor(Math.random() * ROOM_CODE_LETTERS.length)];
  }
  return code;
}

async function unusedRoomCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomRoomCode();
    const existing = await state.database.doc('rooms/' + code).get();
    if (!existing.exists) return code;
  }
  throw new Error('No free room code');
}

function onRoomChange(snapshot) {
  if (!snapshot.exists) return;
  const data = snapshot.data();
  state.room.hostId = data.hostId;

  if (data.status === 'lobby') {
    state.room.settings = data.settings;
    state.room.version = data.version;
    state.game = null;
    state.screen = 'lobby';
    render();
    return;
  }

  // Ignore an older version that arrives after our own newer write.
  if (state.game && data.version < state.game.version) return;
  if (!state.game || data.turnNumber !== state.game.turnNumber) state.feedback = null;
  state.game = data;
  state.screen = 'game';
  render();
}

function onPlayersChange(snapshot) {
  state.room.players = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => a.joinedAt - b.joinedAt);
  if (state.screen === 'lobby') render();
}

// Pass null to create a room, or a code to join one.
async function enterRoom(typedCode) {
  state.error = '';
  state.busy = true;
  render();

  try {
    if (state.user.isGuest) state.user.id = await Auth.signInAsGuest();

    const creating = typedCode === null;
    const code = creating ? await unusedRoomCode() : typedCode.toUpperCase().replace(/[^A-Z]/g, '');
    const room = state.database.doc('rooms/' + code);

    if (creating) {
      await room.set({ status: 'lobby', hostId: state.user.id, settings: state.settings, version: 1 });
    } else if (!code || !(await room.get()).exists) {
      state.busy = false;
      state.error = 'There is no room with that code.';
      render();
      return;
    }

    await room.collection('players').doc(state.user.id).set({
      name: state.user.name,
      photo: state.user.photo,
      hasAccount: !state.user.isGuest,
      joinedAt: Date.now(),
    });

    state.room = { code, hostId: '', settings: state.settings, version: 1, players: [], stopWatching: [] };
    state.room.stopWatching.push(
      room.onSnapshot(onRoomChange, showNetworkError),
      room.collection('players').onSnapshot(onPlayersChange, showNetworkError),
    );
    state.busy = false;
    state.screen = 'lobby';
    render();
  } catch (error) {
    showNetworkError(error);
  }
}

function leaveRoom() {
  if (!state.room) return;
  state.room.stopWatching.forEach((stop) => stop());
  state.room = null;
}

function startOnlineGame() {
  const seats = state.room.players.slice(0, MAX_SEATS).map((player) => ({
    id: player.id,
    name: String(player.name).slice(0, MAX_NAME_LENGTH),
    hasAccount: player.hasAccount,
  }));
  if (seats.length >= 2) save(Game.create(seats, state.room.settings));
}

function backToLobby() {
  const lobby = {
    status: 'lobby',
    hostId: state.room.hostId,
    settings: state.room.settings,
    version: state.game.version + 1,
  };
  roomDocument().set(lobby).catch(showNetworkError);
}

function changeSetting(name, value) {
  if (state.screen !== 'lobby') {
    state.settings = { ...state.settings, [name]: value };
    storage.write('settings', state.settings);
    return;
  }
  state.room.settings = { ...state.room.settings, [name]: value };
  state.room.version += 1;
  roomDocument()
    .update({ settings: state.room.settings, version: state.room.version })
    .catch(showNetworkError);
}


// ---- Local games ----

// The first seat is the person using this device, so a signed-in player's
// results are saved to their account.
function mySeat() {
  return { id: state.user.id, name: state.user.name, hasAccount: !state.user.isGuest };
}

function startLocalGame() {
  const seats = state.seats.map((seat, index) => ({
    ...seat,
    name: seat.name.trim().slice(0, MAX_NAME_LENGTH) || `Player ${index + 1}`,
  }));
  state.game = null;
  state.screen = 'game';
  save(Game.create(seats, state.settings));
}

function addSeat(isBot) {
  if (state.seats.length >= MAX_SEATS) return;
  const number = state.seats.filter((seat) => Boolean(seat.isBot) === isBot).length + 1;
  state.seats.push({ name: `${isBot ? 'Bot' : 'Player'} ${number}`, isBot });
}


// ---- Rendering ----

let renderedTurn = '';

function drawAccountBar() {
  const parts = [];
  if (state.room) parts.push(`<span class="muted">Room ${state.room.code}</span>`);
  if (state.user) {
    const label = state.user.isGuest ? 'Sign in' : 'Sign out';
    const picture = Avatar.html(state.user.photo, state.user.name);
    const name = Views.escapeHtml(state.user.name);
    parts.push(`<button id="profile-button" data-action="edit-profile" title="Edit profile">${picture}${name}</button>`);
    parts.push(`<button data-action="leave-account">${label}</button>`);
  }
  accountBar.innerHTML = parts.join('');
}

function render() {
  const answerBox = document.querySelector('#answer');
  const typed = answerBox ? answerBox.value : '';

  state.canAnswer = isMyTurn(state.game);
  drawAccountBar();
  view.innerHTML = Views[state.screen](state);

  const game = state.game;
  if (state.screen !== 'game' || game.status !== 'playing') return;

  syncClock(game);
  drawClock(game);
  scheduleBot();

  // Keep what was being typed if the screen redraws mid-turn.
  const newBox = document.querySelector('#answer');
  if (turnKey(game) === renderedTurn) newBox.value = typed;
  renderedTurn = turnKey(game);
  if (state.canAnswer) newBox.focus({ preventScroll: true });
}

function show(screen) {
  state.screen = screen;
  state.error = '';
  render();
  window.scrollTo(0, 0);
}

async function showStats(screen) {
  state.stats = null;
  show(screen);
  try {
    state.stats = await Stats.load(state.database);
  } catch (error) {
    console.error(error);
    state.stats = [];
  }
  if (state.screen === screen) render();
}

function goHome() {
  leaveRoom();
  state.game = null;
  state.mode = null;
  state.busy = false;
  show(state.user ? 'home' : 'welcome');
}


// ---- Buttons and forms ----

const actions = {
  'go-home': goHome,
  'leave-account': leaveAccount,
  'edit-profile': editProfile,
  'remove-photo'() {
    state.profileDraft.photo = '';
    render();
  },
  'sign-in-google': () => signIn(Auth.signInWithGoogle),
  'sign-in-apple': () => signIn(Auth.signInWithApple),
  'choose-local'() {
    state.mode = 'local';
    state.seats = [mySeat(), { name: 'Player 2' }];
    show('setup');
  },
  'choose-solo'() {
    state.mode = 'solo';
    state.seats = [mySeat(), { name: 'Bot 1', isBot: true }, { name: 'Bot 2', isBot: true }];
    show('setup');
  },
  'choose-online'() {
    state.mode = 'online';
    show('online');
  },
  'add-player'() {
    addSeat(false);
    render();
  },
  'add-bot'() {
    addSeat(true);
    render();
  },
  'remove-seat'(button) {
    state.seats.splice(Number(button.dataset.index), 1);
    render();
  },
  'start-local': startLocalGame,
  'create-room': () => enterRoom(null),
  'start-online': startOnlineGame,
  'back-to-lobby': backToLobby,
  'change-players'() {
    state.game = null;
    show('setup');
  },
  'play-again'() {
    if (isOnline()) save(Game.create(state.game.seats, state.game.settings));
    else startLocalGame();
  },
  'trust-answer': trustAnswer,
  'show-leaderboard': () => showStats('leaderboard'),
  'show-highscores': () => showStats('highscores'),
};

document.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (button) actions[button.dataset.action](button);
});

document.addEventListener('input', (event) => {
  const seat = event.target.dataset.seat;
  if (seat !== undefined) state.seats[Number(seat)].name = event.target.value;
  if (event.target.id === 'profile-name') state.profileDraft.name = event.target.value;
});

document.addEventListener('change', (event) => {
  const setting = event.target.dataset.setting;
  if (setting) changeSetting(setting, Number(event.target.value));
  if (event.target.id === 'photo-file') choosePhoto(event.target.files[0]);
});

const forms = {
  'guest-form': (form) => playAsGuest(form.querySelector('#guest-name').value),
  'profile-form': () => saveProfile(),
  'email-form': (form, submitter) => submitEmailForm(form, submitter ? submitter.value : 'sign-in'),
  'answer-form': (form) => submitAnswer(form.querySelector('#answer').value),
  'join-form': (form) => enterRoom(form.querySelector('#room-code').value),
};

document.addEventListener('submit', (event) => {
  event.preventDefault();
  forms[event.target.id](event.target, event.submitter);
});


// ---- Start ----

render();
Auth.start(onAccountChange);
state.database = Auth.database();
