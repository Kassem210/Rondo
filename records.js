// Turns the raw text in data.js into lookup tables, and matches what a
// person typed against them.

const Records = (() => {
  const players = new Map();      // key -> { type, key, name, clubs: Set of club keys }
  const clubs = new Map();        // key -> { type, key, name, players: [] }
  const playerNames = new Map();  // typed form -> matching players
  const clubNames = new Map();    // typed form -> matching clubs
  const allPlayers = [];          // in file order, best known first

  const SPECIAL_LETTERS = { ø: 'o', ı: 'i', ł: 'l', đ: 'd', ß: 'ss', æ: 'ae' };

  // "Müller", "muller" and "MULLER" should all compare equal.
  function normalize(text) {
    return String(text)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[øıłđßæ]/g, (letter) => SPECIAL_LETTERS[letter])
      .replace(/['’`.]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  // Club names also ignore "FC", "CF" and "AFC".
  function normalizeClub(text) {
    const words = normalize(text).split(' ');
    const kept = words.filter((word) => !['fc', 'cf', 'afc'].includes(word));
    return (kept.length ? kept : words).join(' ');
  }

  function playerKey(name) {
    return 'p:' + normalize(name);
  }

  function clubKey(name) {
    return 'c:' + normalizeClub(name);
  }

  function addName(index, name, entry) {
    if (!name) return;
    const entries = index.get(name) || [];
    if (!entries.includes(entry)) entries.push(entry);
    index.set(name, entries);
  }

  function splitList(text, separator) {
    return (text || '').split(separator).map((item) => item.trim()).filter(Boolean);
  }

  function loadClubs(raw) {
    for (const line of raw.trim().split('\n')) {
      const [name, aliases] = line.split('|');
      const club = { type: 'club', key: clubKey(name), name, players: [] };
      clubs.set(club.key, club);
      addName(clubNames, normalizeClub(name), club);
      for (const alias of splitList(aliases, ',')) {
        addName(clubNames, normalizeClub(alias), club);
      }
    }
  }

  function loadPlayers(raw) {
    for (const line of raw.trim().split('\n')) {
      const [name, aliases, clubList] = line.split('|');
      const player = { type: 'player', key: playerKey(name), name, clubs: new Set() };

      for (const clubName of splitList(clubList, ';')) {
        const club = clubs.get(clubKey(clubName));
        if (!club) continue;
        player.clubs.add(club.key);
        club.players.push(player);
      }

      players.set(player.key, player);
      allPlayers.push(player);

      // A player can be found by full name, by surname ("van Dijk", "Dijk")
      // or by a listed alias.
      const words = normalize(name).split(' ');
      addName(playerNames, words.join(' '), player);
      for (let i = 1; i < words.length; i++) {
        const surname = words.slice(i).join(' ');
        if (surname.length >= 4) addName(playerNames, surname, player);
      }
      for (const alias of splitList(aliases, ',')) {
        addName(playerNames, normalize(alias), player);
      }
    }
  }

  // Levenshtein distance, giving up once it passes `limit`.
  function editDistance(a, b, limit) {
    if (Math.abs(a.length - b.length) > limit) return limit + 1;

    let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const current = [i];
      let rowBest = i;
      for (let j = 1; j <= b.length; j++) {
        const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
        current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution);
        rowBest = Math.min(rowBest, current[j]);
      }
      if (rowBest > limit) return limit + 1;
      previous = current;
    }
    return previous[b.length];
  }

  // Exact match first, then the closest names within a typo or two.
  function search(index, typed) {
    if (index.has(typed)) return index.get(typed);
    if (typed.length < 5) return [];

    const limit = typed.length >= 9 ? 2 : 1;
    let best = limit + 1;
    let matches = [];
    for (const [name, entries] of index) {
      const distance = editDistance(typed, name, limit);
      if (distance > limit || distance > best) continue;
      if (distance < best) {
        best = distance;
        matches = [];
      }
      for (const entry of entries) {
        if (!matches.includes(entry)) matches.push(entry);
      }
    }
    return matches;
  }

  // Remember a fact confirmed during play, so bots can use it too.
  function link(player, club) {
    if (player.clubs.has(club.key)) return;
    player.clubs.add(club.key);
    club.players.push(player);
  }

  loadClubs(RAW_RECORDS.clubs);
  loadPlayers(RAW_RECORDS.players);

  return {
    players,
    clubs,
    allPlayers,
    normalize,
    normalizeClub,
    playerKey,
    clubKey,
    link,
    findPlayers: (text) => search(playerNames, normalize(text)),
    findClubs: (text) => search(clubNames, normalizeClub(text)),
  };
})();
