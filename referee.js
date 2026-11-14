// Decides whether a typed answer is right. The built-in records are
// checked first, which is instant. Anything they cannot confirm is looked
// up on Wikidata.

const Referee = (() => {
  function find(type, text) {
    return type === 'player' ? Records.findPlayers(text) : Records.findClubs(text);
  }

  // The record for the previous answer, if the records know it.
  function linkedRecord(game) {
    if (!game.link) return null;
    const table = game.link.type === 'player' ? Records.players : Records.clubs;
    return table.get(game.link.key) || null;
  }

  // Pick the first match that has not been said yet.
  function firstUnused(game, type, matches) {
    const unused = matches.find((match) => !game.used.includes(match.key));
    if (!unused) return { ok: false, reason: 'used' };
    return { ok: true, answer: { type, name: unused.name, key: unused.key } };
  }

  function checkRecords(game, text) {
    const type = Game.wanted(game);
    const linked = linkedRecord(game);

    let matches = find(type, text);
    if (game.link) {
      matches = matches.filter((match) => {
        if (!linked) return false;
        return type === 'player' ? match.clubs.has(linked.key) : linked.clubs.has(match.key);
      });
    }
    return matches.length ? firstUnused(game, type, matches) : null;
  }

  async function checkWikidata(game, text) {
    const type = Game.wanted(game);
    const link = game.link;
    // An answer taken on trust has no Wikidata entry to check against.
    if (link && !Wikidata.isId(link.key)) return { ok: false, reason: 'unknown' };

    let found;
    if (type === 'club') {
      found = await Wikidata.findClubsOf(link.key, text);
    } else {
      found = await Wikidata.findPlayers(text);
      if (link) found = found.filter((player) => player.clubIds.includes(link.key));
    }

    if (!found.length) return { ok: false, reason: 'wrong' };
    return firstUnused(game, type, found.map((entry) => ({ key: entry.id, name: entry.name })));
  }

  // Resolves to { ok: true, answer } or { ok: false, reason }, where
  // reason is 'used' (already said), 'wrong' (Wikidata disagrees) or
  // 'unknown' (it could not be checked).
  async function check(game, text) {
    const trustedKey = Records.unlistedKey(Game.wanted(game), text);
    if (game.used.includes(trustedKey)) return { ok: false, reason: 'used' };

    const fromRecords = checkRecords(game, text);
    if (fromRecords) return fromRecords;

    try {
      return await checkWikidata(game, text);
    } catch (error) {
      console.error(error);
      return { ok: false, reason: 'unknown' };
    }
  }

  // Take an answer that could not be confirmed, on the players' word.
  function trust(game, text) {
    const type = Game.wanted(game);
    const name = text.trim().replace(/\s+/g, ' ').slice(0, 40);
    return { type, name, key: Records.unlistedKey(type, name), unchecked: true };
  }

  return { check, trust };
})();
