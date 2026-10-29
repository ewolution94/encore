# Encore

YouTube live sets into Spotify, cut into their tracks. A set saved to a YouTube playlist is
downloaded by Pinchflat on the NAS; Encore shows it with a first tracklist (from the description,
the top comments, or a list you paste), you check the times and trim the start and end, and
**Publish** cuts it into tagged MP3s in a shared folder. Synology Drive brings them to a PC, Spotify
desktop shows them under Local Files, and a playlist takes them to the phone.

For one person, behind Cloudflare Access. Nothing reaches Spotify unchecked, and Encore never talks
to Spotify: there's no upload, so the files go the way local files do.

## How it works

```
YouTube playlist ──► Pinchflat (NAS) ──► staging: <id>.opus, <id>.info.json, <id>-thumb.jpg
                                            │
                                            ▼  scanned once a minute
                                    Encore (this app)
                       sources: description · comments · YouTube's chapters · pasted
                       you: names, trim, tracklist ──► Publish
                                            │
              one encode (MP3, CBR 320, no bit reservoir), cut at frames without encoding again
                                            ▼
                     library: "<album> - 07 - <artist> - <title> [<id>].mp3"
                                            │
                       Synology Drive ──► PC ──► Spotify Local Files ──► phone
```

- **Cutting without gaps.** The trimmed set is encoded once and split at MP3 frame boundaries with
  `-c copy`, so nothing pads the joins and Spotify plays straight through (tested on the user's PC
  and phone; `plans/encore.md` in the workspace has the gap tests). The first part takes no `-ss`
  and the last no `-to`, or the encoder's priming frame and the last frame get lost.
- **Tags.** Title and artist per track (the list's artist, else the set's DJ), the set as the album
  (unique per set, so Spotify keeps it together), the DJ as album artist, `n/total`. ID3v2.3.
- **Files.** Written beside the library under a dot-name and renamed into place, so Drive and Spotify
  never see half a file. Publishing again replaces the set's files; Remove deletes them. The video id
  in every name marks Encore's files.
- **The tracklist parser** (`shared/tracklist.mjs`, used by the server and the page) reads the shapes
  real lists come in: `0:00 Artist - Title`, `[00:57] …`, `0:00 - Artist - Title`, `1:02:03`,
  numbering, times at the end, ranges, mashups ("A - X vs B - Y" keeps the rest in the title). Tests
  run on real descriptions and comments (`tests/fixtures/info`).
- **State** is one SQLite file (`node:sqlite`): each set's draft, what was last published, its files.
  The audio and the info JSON stay Pinchflat's.

## Run it

```bash
npm install
npm run dev        # http://127.0.0.1:7310, against .dev/ (made by scripts/fixtures.mjs)
npm test           # parser, names, Telegram, and a full publish with ffmpeg
npm run check      # svelte-check
npm run build && npm start
```

The dev server needs ffmpeg on the PATH (`brew install ffmpeg`). `npm run dev` first builds
`.dev/staging` from the real info JSON in `tests/fixtures/info`, with a generated tone as the audio,
so no one's music is in the repo.

## Environment

| Variable | Default | |
|---|---|---|
| `PORT` | `8080` | |
| `ENCORE_STAGING` | `/staging` | Pinchflat's downloads (read only) |
| `ENCORE_LIBRARY` | `/library` | the synced folder the MP3s go to |
| `ENCORE_DATA` | `/data` | Encore's database and work folder |
| `ENCORE_FFMPEG` | `ffmpeg` | |
| `ENCORE_ACCESS_TEAM`, `ENCORE_ACCESS_AUD` | unset | Cloudflare Access; unset means unchecked (local only) |
| `ENCORE_TG_BOT_TOKEN`, `ENCORE_TG_CHAT_ID` | unset | the "ready to check" message; unset means off |
| `ENCORE_PUBLIC_URL` | `https://encore.ewolution.cloud` | links in that message |

`/healthz` answers 503 when the scan loop hasn't finished a scan for a few minutes.

## Deploy (NAS)

A push to `release` is the deploy: CI (`.github/workflows/ci.yml`: type check, tests with ffmpeg,
build, a smoke test of the production server) gates `docker-publish.yml`, which publishes
`ghcr.io/ewolution94/encore:latest` for amd64 and arm64; the shared Watchtower pulls it.

The stack is `deploy/portainer-stack.yml` (never `docker-compose.yml`, which builds locally):

- **Encore** on the port from the workspace's registry. `/library` is `music/Encore` mounted through
  the NAS's own SMB as the DSM user `encore` (`ENCORE_SMB_USER`, `ENCORE_SMB_PASSWORD`), not a bind
  mount: Synology Drive only syncs files DSM's file services tell it about, and a container writing
  straight to the disk tells it nothing.
- **Pinchflat** beside it, pinned by digest and without a published port. It watches the YouTube
  playlist and downloads into the `staging` volume, which Encore reads. Its yt-dlp settings
  (`/config/extras/yt-dlp-configs/base-config.txt`) add the top comments to each info JSON.
- Stack variables, set in Portainer: `ENCORE_ACCESS_AUD` (the Access application's tag; until it's
  set Encore answers nothing but `/healthz`), `ENCORE_TG_BOT_TOKEN`, `ENCORE_TG_CHAT_ID`,
  `ENCORE_SMB_USER` and `ENCORE_SMB_PASSWORD` (no commas: Docker's mount options split on them).
- encore.ewolution.cloud sits behind Cloudflare Access, with a bypass for the icons, the manifest and
  the iOS launch images, which iOS fetches without the login cookie.

Installed on a phone or a Mac, Encore opens on a splash of its icon and keeps an offline shell
(`public/sw.js`); the sets always come from the server.

## Livesets in Spotify (Spicetify)

Spotify's Web API can neither add local files to a playlist nor make folders, so the playlists come
from `spicetify/encore-livesets.js`, a [Spicetify](https://spicetify.app) extension in the Spotify
app on the PC. It reads Local Files every few minutes, and for each set (one album each) that has
stopped arriving from Drive it makes a playlist named after the set in a "Livesets" folder, the
newest on top, with the tracks in track order; a set published again gets its playlist put in order
again. It deletes nothing. Spicetify is unofficial: it patches the Spotify app, and a Spotify update
can need `spicetify backup apply` until Spicetify catches up.

Install on the PC (PowerShell, Spotify from spotify.com rather than the Microsoft Store; open a new
PowerShell window after the installer, so `spicetify` is on the PATH; the Extensions folder may not
exist yet, so it's asked for and made):

```powershell
iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
$ext = Join-Path (spicetify path userdata) 'Extensions'; New-Item -ItemType Directory -Force $ext | Out-Null
iwr https://raw.githubusercontent.com/ewolution94/encore/release/spicetify/encore-livesets.js -OutFile (Join-Path $ext 'encore-livesets.js')
spicetify config extensions encore-livesets.js
spicetify apply
```

`tests/spicetify.test.mjs` runs the file as it ships against a stand-in for the app's functions.

## Layout

```
server/      the production server: scan, store, publish, API, Access, Telegram, Census
shared/      the tracklist parser and checks, used by the server and the page
src/         the page (Svelte 5): the sets list, the check view, settings, English and German
scripts/     fixtures.mjs builds .dev/staging for the dev server
tests/       node --test; real tracklists in tests/fixtures/info
deploy/      the Portainer stack
spicetify/   the extension that files each set as a playlist in Spotify on the PC
brand/       the icon (development/plans/app-icons, the Field set)
```
