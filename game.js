// The rules. A game is a plain object, so it can be saved to the room
// database as it is. Functions here never change the game they are given;
// they return a new one.
//
// A seat is { id, name, isBot, hasAccount, lives, passes }.

const Game = (() => {
  function create(seats, settings) {
    return {
      id: Date.now(),
      version: 0,
      status: 'playing',       // 'playing' or 'over'
      settings,                // { seconds, lives }
      seats: seats.map((seat) => ({
        id: seat.id || '',
        name: seat.name,
        isBot: Boolean(seat.isBot),
        hasAccount: Boolean(seat.hasAccount),
        lives: settings.lives,
        passes: 0,
      })),
      turn: 0,                 // index of the seat to answer
      turnNumber: 1,           // goes up every turn
      link: null,              // the last answer: { type, name, key }
      chain: [],               // names in the current chain
      used: [],                // keys of every answer so far
      lastEvent: null,
      winner: null,            // seat index
    };
  }

  // What the current seat has to name.
  function wanted(game) {
    return game.link && game.link.type === 'player' ? 'club' : 'player';
  }

  function seatsAlive(game) {
    return game.seats.filter((seat) => seat.lives > 0);
  }

  function nextSeatAlive(game) {
    const count = game.seats.length;
    for (let step = 1; step <= count; step++) {
      const index = (game.turn + step) % count;
      if (game.seats[index].lives > 0) return index;
    }
    return game.turn;
  }

  function endTurn(game) {
    game.turn = nextSeatAlive(game);
    game.turnNumber += 1;

    // A group plays until one seat is left. A lone player plays until
    // their lives run out.
    const alive = seatsAlive(game);
    const isGroup = game.seats.length > 1;
    if (alive.length <= (isGroup ? 1 : 0)) {
      game.status = 'over';
      game.winner = isGroup && alive.length ? game.seats.indexOf(alive[0]) : null;
    }
  }

  function copy(game) {
    return JSON.parse(JSON.stringify(game));
  }

  function acceptAnswer(current, answer) {
    const game = copy(current);
    game.seats[game.turn].passes += 1;
    game.chain.push(answer.name);
    game.used.push(answer.key);
    game.link = { type: answer.type, name: answer.name, key: answer.key };
    game.lastEvent = {
      kind: 'answer',
      seat: game.turn,
      name: answer.name,
      unchecked: Boolean(answer.unchecked),
    };
    endTurn(game);
    return game;
  }

  // The seat loses a life and the next seat starts a new chain.
  function miss(current, reason) {
    const game = copy(current);
    const example = possibleAnswers(current)[0];
    game.seats[game.turn].lives -= 1;
    game.lastEvent = {
      kind: 'miss',
      seat: game.turn,
      reason,                                   // 'time' or 'blank'
      example: current.link && example ? example.name : '',
    };
    game.link = null;
    game.chain = [];
    endTurn(game);
    return game;
  }

  // Unused answers the records know for the current turn.
  function possibleAnswers(game) {
    const used = new Set(game.used);
    const unused = (entry) => !used.has(entry.key);

    if (!game.link) return Records.allPlayers.filter(unused);

    if (wanted(game) === 'club') {
      const player = Records.players.get(game.link.key);
      if (!player) return [];
      return [...player.clubs].map((key) => Records.clubs.get(key)).filter(unused);
    }

    const club = Records.clubs.get(game.link.key);
    return club ? club.players.filter(unused) : [];
  }

  return { create, wanted, nextSeatAlive, acceptAnswer, miss, possibleAnswers };
})();
