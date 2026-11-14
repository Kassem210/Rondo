// One function per screen. Each takes the app state and returns HTML.

const Views = (() => {
  const SECONDS_CHOICES = [10, 15, 20, 30];
  const LIVES_CHOICES = [1, 2, 3, 5];

  function escapeHtml(text) {
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(text).replace(/[&<>"']/g, (character) => entities[character]);
  }

  function plural(count, word) {
    return `${count} ${word}${count === 1 ? '' : 's'}`;
  }

  function livesText(count) {
    return count === 1 ? '1 life' : `${count} lives`;
  }

  function possessive(name) {
    return name.endsWith('s') ? `${name}’` : `${name}’s`;
  }

  function select(id, label, choices, current, describe) {
    const options = choices.map((choice) => {
      const selected = choice === current ? ' selected' : '';
      return `<option value="${choice}"${selected}>${describe(choice)}</option>`;
    });
    return `
      <label class="field">
        <span>${label}</span>
        <select id="${id}" data-setting="${id}">${options.join('')}</select>
      </label>`;
  }

  function settingsFields(settings) {
    return `
      <div class="fields">
        ${select('seconds', 'Time per turn', SECONDS_CHOICES, settings.seconds, (n) => `${n} seconds`)}
        ${select('lives', 'Lives', LIVES_CHOICES, settings.lives, (n) => n)}
      </div>`;
  }

  function errorLine(state) {
    return state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : '';
  }

  function accountsUnavailable() {
    return Auth.scriptsBlocked
      ? 'Sign-in could not load. Check your connection, turn off any content blocker for this site, and reload.'
      : 'Accounts are not set up on this site yet.';
  }

  function welcome(state) {
    const accounts = Auth.isConfigured
      ? `
      <h2>Sign in or create an account</h2>
      <p class="muted">An account puts your wins and scores on the leaderboard.</p>
      <div class="stack">
        <button data-action="sign-in-google">Continue with Google</button>
        <button data-action="sign-in-apple">Continue with Apple</button>
      </div>
      <form id="email-form" class="stack">
        <input type="email" id="email" placeholder="Email" autocomplete="email" aria-label="Email">
        <input type="password" id="password" placeholder="Password" autocomplete="current-password"
          aria-label="Password">
        <input type="text" id="account-name" maxlength="14" placeholder="Name (new accounts only)"
          autocomplete="nickname" aria-label="Name for a new account">
        <div class="row">
          <button name="intent" value="sign-in">Sign in</button>
          <button name="intent" value="create">Create account</button>
        </div>
      </form>`
      : `<p class="muted">${accountsUnavailable()}</p>`;

    return `
      <h1>Rondo</h1>
      <p>
        A football knowledge game. Name a player, then a club they played for,
        then a player from that club, and keep going before the clock runs out.
      </p>
      <form id="guest-form" class="row">
        <input type="text" id="guest-name" maxlength="14" placeholder="Your name"
          autocomplete="nickname" aria-label="Your name" value="${escapeHtml(state.guestName)}">
        <button class="primary">Play as guest</button>
      </form>
      ${accounts}
      ${errorLine(state)}`;
  }

  function home() {
    return `
      <h1>Rondo</h1>
      <p class="muted">Neymar → Barcelona → Xavi → Al Sadd → Raúl → Real Madrid → …</p>

      <div class="stack">
        <button class="primary" data-action="choose-local">Pass and play</button>
        <button data-action="choose-online">Play online</button>
        <button data-action="choose-solo">Play against bots</button>
      </div>
      <div class="row">
        <button data-action="show-leaderboard">Leaderboard</button>
        <button data-action="show-highscores">High scores</button>
      </div>

      <h2>Rules</h2>
      <ol>
        <li>The first person names any player.</li>
        <li>The next names a club that player played for, the next a player from that club, and so on.</li>
        <li>No answer can be used twice.</li>
        <li>If your time runs out you lose a life and the next person starts a new chain.</li>
        <li>The last person with lives left wins.</li>
      </ol>`;
  }

  function setup(state) {
    const canRemove = state.seats.length > 1;
    const rows = state.seats.map((seat, index) => `
      <li class="row">
        <input type="text" id="seat-${index}" data-seat="${index}" maxlength="14"
          value="${escapeHtml(seat.name)}" aria-label="Name of player ${index + 1}">
        <span class="muted">${seat.isBot ? 'Bot' : ''}</span>
        ${canRemove ? `<button data-action="remove-seat" data-index="${index}">Remove</button>` : ''}
      </li>`);
    const full = state.seats.length >= 8 ? 'disabled' : '';

    return `
      <h1>Players</h1>
      <ul class="plain">${rows.join('')}</ul>
      <div class="row">
        <button data-action="add-player" ${full}>Add player</button>
        <button data-action="add-bot" ${full}>Add bot</button>
      </div>
      ${settingsFields(state.settings)}
      <button class="primary" data-action="start-local">Start game</button>`;
  }

  function online(state) {
    if (!Auth.isConfigured) {
      return `
        <h1>Play online</h1>
        <p>Online play is not set up on this site yet. Pass and play works without it.</p>
        <button data-action="choose-local">Pass and play</button>`;
    }

    const busy = state.busy ? 'disabled' : '';
    return `
      <h1>Play online</h1>
      <p class="muted">Playing as ${escapeHtml(state.user.name)}.</p>
      <button class="primary" data-action="create-room" ${busy}>Create a room</button>

      <h2>Join a room</h2>
      <form id="join-form" class="row">
        <input type="text" id="room-code" maxlength="4" placeholder="Code"
          autocomplete="off" autocapitalize="characters" aria-label="Room code">
        <button ${busy}>Join</button>
      </form>
      ${errorLine(state)}`;
  }

  function lobby(state) {
    const { room } = state;
    const players = room.players.map((player) => {
      const you = player.id === state.user.id ? ' (you)' : '';
      return `<li>${escapeHtml(player.name)}${you}</li>`;
    });
    const isHost = room.hostId === state.user.id;
    const enough = room.players.length >= 2;

    const hostControls = `
      ${settingsFields(room.settings)}
      <button class="primary" data-action="start-online" ${enough ? '' : 'disabled'}>
        ${enough ? 'Start game' : 'Waiting for another player'}
      </button>`;
    const guestNote = `
      <p class="muted">
        ${plural(room.settings.seconds, 'second')} per turn, ${livesText(room.settings.lives)}.
        Waiting for the host to start.
      </p>`;

    return `
      <h1>Room ${escapeHtml(room.code)}</h1>
      <p class="muted">Friends open this page, choose Play online and enter the code.</p>
      <h2>Players</h2>
      <ul>${players.join('') || '<li class="muted">Joining…</li>'}</ul>
      ${isHost ? hostControls : guestNote}
      ${errorLine(state)}
      <button data-action="go-home">Leave room</button>`;
  }

  function prompt(game) {
    if (!game.link) return 'Name any player';
    const name = `<strong>${escapeHtml(game.link.name)}</strong>`;
    return Game.wanted(game) === 'club'
      ? `Name a club ${name} played for`
      : `Name a player who played for ${name}`;
  }

  function lastEventText(game) {
    const event = game.lastEvent;
    if (!event) return '';
    const name = game.seats[event.seat].name;
    if (event.kind === 'answer') {
      return `${name} said ${event.name}${event.unchecked ? ' (not checked)' : ''}.`;
    }

    const what = event.reason === 'blank' ? 'had no answer' : 'ran out of time';
    const example = event.example ? ` One answer was ${event.example}.` : '';
    return `${name} ${what} and lost a life.${example}`;
  }

  function seatList(game) {
    const rows = game.seats.map((seat, index) => {
      const current = game.status === 'playing' && index === game.turn;
      const classes = [current ? 'current' : '', seat.lives > 0 ? '' : 'out'].join(' ').trim();
      const lives = seat.lives > 0 ? livesText(seat.lives) : 'Out';
      return `
        <tr class="${classes}">
          <td>${escapeHtml(seat.name)}</td>
          <td>${lives}</td>
          <td>${plural(seat.passes, 'answer')}</td>
        </tr>`;
    });
    return `<table><tbody>${rows.join('')}</tbody></table>`;
  }

  function playing(state, game) {
    const seat = game.seats[game.turn];
    const myTurn = state.canAnswer;
    const whose = state.mode === 'online' && myTurn ? 'Your turn' : `${possessive(seat.name)} turn`;
    const wanted = Game.wanted(game);

    const feedback = state.feedback || { text: lastEventText(game) };
    const trustButton = feedback.trustText
      ? '<button data-action="trust-answer">Count it anyway</button>'
      : '';

    const waitingFor = seat.isBot ? `${seat.name} is thinking…` : `Waiting for ${seat.name}…`;
    const disabled = myTurn && !state.busy ? '' : 'disabled';

    return `
      <p class="muted">${escapeHtml(whose)}</p>
      <h1 class="prompt">${prompt(game)}</h1>

      <div class="timer">
        <div class="timer-track"><div class="timer-bar" id="timer-bar"></div></div>
        <span id="timer-text"></span>
      </div>

      <form id="answer-form" class="row">
        <input type="text" id="answer" maxlength="60" autocomplete="off" spellcheck="false"
          enterkeyhint="send" aria-label="Your answer" ${disabled}
          placeholder="${escapeHtml(myTurn ? `Type a ${wanted}` : waitingFor)}">
        <button class="primary" ${disabled}>Submit</button>
      </form>

      <p class="${feedback.isError ? 'error' : 'muted'}" aria-live="polite">
        ${escapeHtml(feedback.text)} ${trustButton}
      </p>
      ${errorLine(state)}

      <h2>Chain</h2>
      <p>${game.chain.map(escapeHtml).join(' → ') || '<span class="muted">Not started</span>'}</p>

      <h2>Players</h2>
      ${seatList(game)}`;
  }

  function finished(state, game) {
    const title = game.winner === null ? 'Game over' : `${game.seats[game.winner].name} wins`;
    const isHost = state.mode !== 'online' || state.room.hostId === state.user.id;
    const secondAction = state.mode === 'online' ? 'back-to-lobby' : 'change-players';
    const secondLabel = state.mode === 'online' ? 'Back to room' : 'Change players';

    const buttons = isHost
      ? `<div class="row">
           <button class="primary" data-action="play-again">Play again</button>
           <button data-action="${secondAction}">${secondLabel}</button>
         </div>`
      : '<p class="muted">Waiting for the host to start another game.</p>';

    return `
      <h1>${escapeHtml(title)}</h1>
      ${seatList(game)}
      ${buttons}
      ${errorLine(state)}`;
  }

  // A ranked table of the players that pass `counts`, highest `value` first.
  function ranking(state, { title, note, empty, counts, value, columns }) {
    const guestNote = state.user.isGuest ? 'Sign in to appear here.' : '';
    const heading = `
      <h1>${title}</h1>
      <p class="muted">${note} ${guestNote}</p>`;

    if (!Auth.isConfigured) return `${heading}<p>Accounts are not set up on this site yet.</p>`;

    if (state.stats === null) return `${heading}<p class="muted">Loading…</p>`;

    const players = state.stats.filter(counts).sort((a, b) => value(b) - value(a)).slice(0, 50);
    if (!players.length) return `${heading}<p>${empty}</p>`;

    const rows = players.map((player, index) => `
      <tr>
        <td>${index + 1}. ${escapeHtml(player.name)}</td>
        ${columns(player).map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
      </tr>`);
    return `${heading}<table><tbody>${rows.join('')}</tbody></table>`;
  }

  function leaderboard(state) {
    return ranking(state, {
      title: 'Leaderboard',
      note: 'Games won, all time. Only games with two or more people count.',
      empty: 'Nobody has won a game yet.',
      counts: (player) => player.wins > 0,
      value: (player) => player.wins,
      columns: (player) => [plural(player.wins, 'win'), plural(player.games, 'game')],
    });
  }

  function highscores(state) {
    return ranking(state, {
      title: 'High scores',
      note: 'Each player’s most answers in a single game.',
      empty: 'No scores yet.',
      counts: (player) => player.best > 0,
      value: (player) => player.best,
      columns: (player) => [
        plural(player.best, 'answer'),
        new Date(player.bestAt).toLocaleDateString(),
      ],
    });
  }

  function game(state) {
    return state.game.status === 'playing' ? playing(state, state.game) : finished(state, state.game);
  }

  return { welcome, home, setup, online, lobby, game, leaderboard, highscores, escapeHtml };
})();
