# Rondo

A football knowledge game for a group. Someone names a player, the next
person names a club that player played for, the next a player from that
club, and so on, against a clock. Run out of time and you lose a life. The
last person with lives left wins.

## Ways to play

- **Pass and play**: one device handed round the group.
- **Play online**: one person creates a room and shares the four-letter code.
- **Play against bots**: practice on your own.

You can play as a guest, or sign in with Google, Apple or an email and
password. Signed-in players appear on the leaderboard (games won) and the
high scores page (most answers in one game).

Tap your name at the top to change it or add a profile picture.

## Running it

It is a static site with no build step. Open `index.html` in a browser, or
serve the folder:

```bash
python3 -m http.server 8000
```

Guest play on one device works straight away. Accounts, online rooms and
the leaderboard need a Firebase project, set up below.

## Setting up Firebase

1. Create a project at <https://console.firebase.google.com>.
2. Add a **Web app** to it and copy the config object into
   `firebase-config.js`, replacing `null`.
3. Under **Authentication > Sign-in method**, enable:
   - **Anonymous** (lets guests join online rooms)
   - **Email/Password**
   - **Google**
   - **Apple** (needs a paid Apple Developer account; skip it if you do not
     have one and remove the Apple button from `views.js`)
4. Under **Authentication > Settings > Authorized domains**, add the domain
   the site is served from, for example `your-name.github.io`.
5. Create a **Firestore Database** and paste the contents of
   `firestore.rules` into its **Rules** tab.

The values in `firebase-config.js` are public identifiers, not secrets. The
rules in `firestore.rules` are what protect the data.

## Publishing on GitHub Pages

In the repository on GitHub, open **Settings > Pages**, choose **Deploy from
a branch**, pick `main` and the root folder, and save. The site appears at
`https://<your-name>.github.io/<repository>/`.

## Files

| File | What it holds |
|---|---|
| `index.html`, `style.css` | the page and its styling |
| `data.js` | the player and club lists, generated from Wikidata |
| `records.js` | looking up names and forgiving typos |
| `game.js` | the rules |
| `wikidata.js` | looking up answers that are not in `data.js` |
| `referee.js` | deciding if an answer is right |
| `stats.js` | saving and loading leaderboard results and profiles |
| `auth.js` | signing in and out |
| `avatar.js` | shrinking and showing profile pictures |
| `views.js` | one function per screen |
| `app.js` | clock, bots, online rooms, button handlers |
| `firebase-config.js` | your Firebase project details |
| `firestore.rules` | who may read and write the database |
| `tools/` | the script that rebuilds `data.js` |

## Where the player data comes from

`data.js` is generated from [Wikidata](https://www.wikidata.org), the
database behind Wikipedia. It holds every footballer with articles in 20 or
more Wikipedia languages, and every club Wikidata lists for them.

An answer that is not in `data.js` is looked up on Wikidata while you play,
which takes a second or so. If that lookup fails or disagrees, the answer
can still be counted with **Count it anyway**.

To refresh the data after a transfer window:

```bash
rm -rf tools/cache
```

```bash
python3 tools/build_data.py
```

The download takes about 15 minutes because the service allows roughly one
query a minute. `tools/club_names.txt` and `tools/player_nicknames.txt`
hold hand-written short names and nicknames ("Barca", "CR7") that are added
on top of Wikidata's own.

## Known limits

- Wikidata is edited by volunteers, so the odd career list is incomplete or
  slow to pick up a new transfer.
- Any signed-in player can write leaderboard results, so the tables are
  only as trustworthy as the people playing.
