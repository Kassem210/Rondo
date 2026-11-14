// Live lookups against Wikidata, for answers the built-in records do not
// hold. Both functions reject if the service is slow or unreachable.

const Wikidata = (() => {
  const ENDPOINT = 'https://query.wikidata.org/sparql';
  const TIMEOUT = 6000;
  const FOOTBALLER = 'wd:Q937857';
  const NATIONAL_TEAM = /national|olympic|under-\d|\bU-?\d\d\b/i;
  const CLUB_AFFIXES = /^(FC|AFC) | (F\.C\.|FC|A\.F\.C\.|AFC|C\.F\.|CF)$/;

  function isId(key) {
    return /^Q\d+$/.test(key);
  }

  async function query(sparql) {
    const url = `${ENDPOINT}?format=json&query=${encodeURIComponent(sparql)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!response.ok) throw new Error(`Wikidata answered ${response.status}`);

    const { results } = await response.json();
    return results.bindings.map((row) => {
      const plain = {};
      for (const [name, cell] of Object.entries(row)) plain[name] = cell.value;
      return plain;
    });
  }

  // Wikidata's own name search, which knows nicknames and other spellings.
  function searchFor(text) {
    const typed = text.replace(/[\\"\n\r]/g, ' ').slice(0, 60);
    return `
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch" ;
          wikibase:endpoint "www.wikidata.org" ;
          mwapi:search "${typed}" ;
          mwapi:language "en" .
        ?item wikibase:apiOutputItem mwapi:item .
      }`;
  }

  // Footballers matching a typed name: [{ id, name, clubIds }].
  async function findPlayers(text) {
    const rows = await query(`
      SELECT ?item ?name
        (GROUP_CONCAT(DISTINCT STRAFTER(STR(?team), "entity/"); separator=" ") AS ?teams)
      WHERE {
        ${searchFor(text)}
        ?item wdt:P106 ${FOOTBALLER} ; rdfs:label ?name .
        FILTER(LANG(?name) = "en")
        OPTIONAL { ?item p:P54/ps:P54 ?team . }
      } GROUP BY ?item ?name`);

    return rows.map((row) => ({
      id: row.item.split('/').pop(),
      name: row.name,
      clubIds: row.teams ? row.teams.split(' ') : [],
    }));
  }

  // Clubs matching a typed name that the player played for: [{ id, name }].
  async function findClubsOf(playerId, text) {
    const rows = await query(`
      SELECT ?item ?name WHERE {
        ${searchFor(text)}
        wd:${playerId} p:P54/ps:P54 ?item .
        ?item rdfs:label ?name .
        FILTER(LANG(?name) = "en")
      }`);

    return rows
      .filter((row) => !NATIONAL_TEAM.test(row.name))
      .map((row) => ({
        id: row.item.split('/').pop(),
        name: row.name.replace(CLUB_AFFIXES, '').trim(),
      }));
  }

  return { isId, findPlayers, findClubsOf };
})();
