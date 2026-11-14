"""Rebuilds ../data.js from Wikidata.

Downloads every footballer who has articles in at least MIN_LINKS
Wikipedia languages, with every club Wikidata lists for them, and writes
them in the format records.js reads. Downloads are kept in tools/cache,
so delete that folder to fetch fresh data.

    python3 tools/build_data.py
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

import wikidata

TOOLS = Path(__file__).parent
CACHE = TOOLS / 'cache'
OUTPUT = TOOLS.parent / 'data.js'

# Wikipedia language count is a rough measure of fame. Each range is one
# query, kept small enough to finish inside the service's time limit.
LINK_RANGES = [(40, 100000), (30, 40), (24, 30), (20, 24)]
MIN_LINKS = LINK_RANGES[-1][0]

TEAM_BATCH = 2500
MAX_ALIASES = 8
MAX_ALIAS_LENGTH = 30

NATIONAL_TEAM = re.compile(r'national|olympic|under-\d|\bU-?\d\d\b', re.IGNORECASE)
CLUB_AFFIXES = re.compile(r'^(FC|AFC) | (F\.C\.|FC|A\.F\.C\.|AFC|C\.F\.|CF)$')


def cached(name, fetch):
    """Return the saved result called `name`, fetching it first if needed."""
    CACHE.mkdir(exist_ok=True)
    path = CACHE / f'{name}.json'
    if not path.exists():
        print(f'fetching {name}', file=sys.stderr)
        path.write_text(json.dumps(fetch()))
    return json.loads(path.read_text())


def normalize(text):
    """The same simplification records.js applies to typed names."""
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c)).lower()
    for letter, plain in {'ø': 'o', 'ı': 'i', 'ł': 'l', 'đ': 'd', 'ß': 'ss', 'æ': 'ae'}.items():
        text = text.replace(letter, plain)
    text = re.sub(r"['’`.]", '', text)
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()


def fetch_players(low, high):
    return wikidata.query(f'''
        SELECT ?item ?name ?links
          (GROUP_CONCAT(DISTINCT STRAFTER(STR(?team), "entity/"); separator=" ") AS ?teams)
        WHERE {{
          ?item wdt:P106 wd:Q937857 ; wikibase:sitelinks ?links .
          FILTER(?links >= {low} && ?links < {high})
          ?item p:P54/ps:P54 ?team .
          ?item rdfs:label ?name . FILTER(LANG(?name) = "en")
        }} GROUP BY ?item ?name ?links''')


def fetch_player_aliases(low, high):
    return wikidata.query(f'''
        SELECT ?item (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases) WHERE {{
          ?item wdt:P106 wd:Q937857 ; wikibase:sitelinks ?links .
          FILTER(?links >= {low} && ?links < {high})
          ?item skos:altLabel ?alias . FILTER(LANG(?alias) = "en")
        }} GROUP BY ?item''')


def fetch_teams(ids):
    values = ' '.join(f'wd:{team}' for team in ids)
    return wikidata.query(f'''
        SELECT ?item ?name ?links (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases) WHERE {{
          VALUES ?item {{ {values} }}
          ?item rdfs:label ?name . FILTER(LANG(?name) = "en")
          ?item wikibase:sitelinks ?links .
          OPTIONAL {{ ?item skos:altLabel ?alias . FILTER(LANG(?alias) = "en") }}
        }} GROUP BY ?item ?name ?links''')


def clean_aliases(text, own_name):
    """Short, distinct aliases that are safe to store one per comma."""
    seen = {normalize(own_name)}
    kept = []
    for alias in text.split('|'):
        alias = alias.replace(',', ' ').strip()
        key = normalize(alias)
        if not key or key in seen or len(alias) > MAX_ALIAS_LENGTH:
            continue
        seen.add(key)
        kept.append(alias)
    return kept[:MAX_ALIASES]


def read_overrides(filename):
    """Hand-written "Name|alias,alias" lines, keyed by normalized name."""
    overrides = {}
    for line in (TOOLS / filename).read_text().splitlines():
        name, _, aliases = line.partition('|')
        overrides[normalize(name)] = (name, [a.strip() for a in aliases.split(',') if a.strip()])
    return overrides


def apply_overrides(entries, overrides):
    """Give the best-known entry matching each override its name and aliases."""
    by_name = {}
    for entry in entries:
        for name in [entry['name'], *entry['aliases']]:
            by_name.setdefault(normalize(name), []).append(entry)

    unmatched = []
    for key, (name, aliases) in overrides.items():
        matches = by_name.get(key)
        if not matches:
            unmatched.append(name)
            continue
        best = max(matches, key=lambda entry: entry['links'])
        extra = [alias for alias in [best['name'], *aliases] if normalize(alias) != normalize(name)]
        best['aliases'] = clean_aliases('|'.join(extra + best['aliases']), name)
        best['name'] = name
    return unmatched


def load_players():
    players = {}
    for low, high in LINK_RANGES:
        for row in cached(f'players_{low}_{high}', lambda: fetch_players(low, high)):
            players[wikidata.entity_id(row['item'])] = {
                'id': wikidata.entity_id(row['item']),
                'name': row['name'].replace('|', ' '),
                'links': int(row['links']),
                'teams': row['teams'].split(),
                'aliases': [],
            }
        for row in cached(f'aliases_{low}_{high}', lambda: fetch_player_aliases(low, high)):
            player = players.get(wikidata.entity_id(row['item']))
            if player:
                player['aliases'] = clean_aliases(row['aliases'], player['name'])
    return list(players.values())


def load_clubs(players):
    ids = sorted({team for player in players for team in player['teams']})
    clubs = []
    for start in range(0, len(ids), TEAM_BATCH):
        batch = ids[start:start + TEAM_BATCH]
        for row in cached(f'teams_{MIN_LINKS}_{start}', lambda: fetch_teams(batch)):
            if NATIONAL_TEAM.search(row['name']):
                continue
            name = CLUB_AFFIXES.sub('', row['name']).replace('|', ' ').strip()
            aliases = '|'.join([row['name'], row.get('aliases', '')])
            clubs.append({
                'id': wikidata.entity_id(row['item']),
                'name': name,
                'links': int(row['links']),
                'aliases': clean_aliases(aliases, name),
            })
    return clubs


def write_output(players, clubs):
    club_links = {club['id']: club['links'] for club in clubs}

    player_lines = []
    used_clubs = set()
    for player in sorted(players, key=lambda player: -player['links']):
        teams = sorted((t for t in player['teams'] if t in club_links), key=lambda t: -club_links[t])
        if not teams:
            continue
        used_clubs.update(teams)
        fields = [player['id'], player['name'], ','.join(player['aliases']), ' '.join(teams)]
        player_lines.append('|'.join(fields))

    club_lines = [
        '|'.join([club['id'], club['name'], ','.join(club['aliases'])])
        for club in sorted(clubs, key=lambda club: -club['links'])
        if club['id'] in used_clubs
    ]

    def block(lines):
        return '\n'.join(lines).replace('\\', '').replace('`', "'").replace('${', '$ {')

    OUTPUT.write_text(
        '// Generated from Wikidata by tools/build_data.py. Do not edit by hand.\n'
        '// One record per line, best known first.\n'
        '//   clubs:   id|Name|alias,alias\n'
        '//   players: id|Name|alias,alias|club id club id\n'
        'const RAW_RECORDS = {\n'
        f'clubs: `\n{block(club_lines)}\n`,\n'
        f'players: `\n{block(player_lines)}\n`\n'
        '};\n'
    )
    print(f'wrote {len(player_lines)} players and {len(club_lines)} clubs', file=sys.stderr)


def main():
    players = load_players()
    clubs = load_clubs(players)

    missing = apply_overrides(clubs, read_overrides('club_names.txt'))
    missing += apply_overrides(players, read_overrides('player_nicknames.txt'))
    if missing:
        print('no match for: ' + ', '.join(missing), file=sys.stderr)

    write_output(players, clubs)


if __name__ == '__main__':
    main()
