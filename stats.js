// All-time results, one database entry per account:
//   { name, wins, games, best, bestAt }
// "best" is the most answers that player has given in one game.
// Guests are not recorded.

const Stats = (() => {
  function addResult(entry, result) {
    const updated = {
      name: result.name,
      wins: (entry ? entry.wins : 0) + (result.won ? 1 : 0),
      games: (entry ? entry.games : 0) + 1,
      best: entry ? entry.best : 0,
      bestAt: entry ? entry.bestAt : 0,
    };
    if (result.answers > updated.best) {
      updated.best = result.answers;
      updated.bestAt = Date.now();
    }
    return updated;
  }

  // One result per seat that belongs to an account. A win only counts
  // when at least two people played, so beating bots does not reach the
  // leaderboard.
  function resultsOf(game) {
    const humans = game.seats.filter((seat) => !seat.isBot);
    const winner = game.winner === null ? null : game.seats[game.winner];

    return game.seats
      .filter((seat) => seat.hasAccount)
      .map((seat) => ({
        id: seat.id,
        name: seat.name,
        answers: seat.passes,
        won: humans.length >= 2 && seat === winner,
      }));
  }

  async function record(game, database) {
    if (!database) return;
    for (const result of resultsOf(game)) {
      const entry = database.collection('players').doc(result.id);
      const saved = await entry.get();
      const { id, ...fields } = result;
      await entry.set(addResult(saved.exists ? saved.data() : null, fields));
    }
  }

  async function load(database) {
    if (!database) return [];
    const saved = await database.collection('players').get();
    return saved.docs.map((doc) => doc.data());
  }

  return { record, load };
})();
