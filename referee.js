// Decides whether a typed answer is right, using the built-in records.

const Referee = (() => {
  function keyFor(type, text) {
    return type === 'player' ? Records.playerKey(text) : Records.clubKey(text);
  }

  function find(type, text) {
    return type === 'player' ? Records.findPlayers(text) : Records.findClubs(text);
  }

  // The record for the previous answer, if the records know it.
  function linkedRecord(game) {
    if (!game.link) return null;
    const table = game.link.type === 'player' ? Records.players : Records.clubs;
    return table.get(game.link.key) || null;
  }

  function playedFor(player, club) {
    return player.clubs.has(club.key);
  }

  // Returns { ok: true, answer } or { ok: false, reason }, where reason is
  // 'used' (already said) or 'unknown' (the records cannot confirm it).
  function check(game, text) {
    const type = Game.wanted(game);
    const used = new Set(game.used);
    const linked = linkedRecord(game);

    let matches = find(type, text);
    if (game.link) {
      matches = matches.filter((match) => {
        if (!linked) return false;
        return type === 'player' ? playedFor(match, linked) : playedFor(linked, match);
      });
    }

    if (!matches.length) {
      return { ok: false, reason: used.has(keyFor(type, text)) ? 'used' : 'unknown' };
    }
    const unused = matches.find((match) => !used.has(match.key));
    if (!unused) return { ok: false, reason: 'used' };
    return { ok: true, answer: { type, name: unused.name, key: unused.key } };
  }

  // Take an answer the records do not know, on the players' word.
  function trust(game, text) {
    const type = Game.wanted(game);
    const name = text.trim().replace(/\s+/g, ' ').slice(0, 40);
    return { type, name, key: keyFor(type, name), unchecked: true };
  }

  return { check, trust };
})();
