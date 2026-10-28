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
