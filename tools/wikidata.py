"""Small client for the Wikidata query service, used by build_data.py."""

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ENDPOINT = 'https://query.wikidata.org/sparql'
USER_AGENT = 'RondoGameDataBuild/1.0 (https://github.com/Kassem210/Rondo)'
SECONDS_BETWEEN_QUERIES = 65   # the service can limit clients to one query a minute

_last_query_at = 0.0


def query(sparql, attempts=4):
    """Run a query and return its rows as plain dicts of strings."""
    global _last_query_at
    body = urllib.parse.urlencode({'query': sparql}).encode()
    headers = {'User-Agent': USER_AGENT, 'Accept': 'application/sparql-results+json'}

    for attempt in range(attempts):
        wait = _last_query_at + SECONDS_BETWEEN_QUERIES - time.time()
        if wait > 0:
            time.sleep(wait)
        _last_query_at = time.time()

        try:
            request = urllib.request.Request(ENDPOINT, data=body, headers=headers)
            with urllib.request.urlopen(request, timeout=120) as response:
                bindings = json.load(response)['results']['bindings']
            return [{name: cell['value'] for name, cell in row.items()} for row in bindings]
        except urllib.error.HTTPError as error:
            print(f'query failed with HTTP {error.code}, attempt {attempt + 1}', file=sys.stderr)
            if error.code not in (429, 500, 502, 503, 504):
                raise

    raise RuntimeError('Wikidata did not answer')


def entity_id(uri):
    return uri.rsplit('/', 1)[-1]
