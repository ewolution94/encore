// @ts-nocheck
// 1001Tracklists → Encore: a bookmarklet for a tracklist page on 1001tracklists.com. It reads the
// page that's open in the browser (nothing is fetched or sent anywhere), turns the tracklist into
// the lines Encore's paste box reads ("1:02:34 Artist - Title (Remix)"), copies them and shows them
// in a panel to check.
//
// - A numbered row with a time starts a track. Its name is 1001Tracklists' own "Artist - Title
//   (Remix)", without the label.
// - "w/" rows are tracks played over the one before: they join its title after "w/" (a switch in
//   the panel leaves them out). A "w/" row's own time doesn't start a track.
// - A mashup's parts (the rows under it) are already in its name and are left out.
// - A track without a time can't be cut: the panel names it, to add in Encore by hand.
//
// It reads the page as HTML text, so tests/bookmarklet.test.mjs runs the same code on a real page
// (tests/fixtures/1001tracklists.html). Encore's paste box offers it as a link to drag to the
// bookmarks bar (src/lib/bookmarklet.ts); everything it uses lives inside this one function.

(function encoreFrom1001Tracklists(root) {
  /** The HTML entities in an attribute's text. */
  function decode(text) {
    const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
    return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, code) => {
      if (code[0] !== '#') return named[code.toLowerCase()] ?? all;
      return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
    });
  }

  /** The tracklist's rows in page order: { kind: 'track' | 'with' | 'part', start, name }, the start
   *  in seconds or null. Raw markup and a browser's serialisation both work. */
  function readRows(html) {
    const found = [...html.matchAll(/<div\b[^>]*\bclass="[^"]*\b(tlpTog|tlpSubTog)\b[^"]*"/g)];
    const rows = [];
    found.forEach((match, i) => {
      const row = html.slice(match.index, found[i + 1]?.index ?? html.length);
      const name = /<meta\b[^>]*\bitemprop="name"[^>]*\bcontent="([^"]*)"/.exec(row);
      if (!name) return;
      const number = /_tracknumber_value"[^>]*>\s*([^<]*?)\s*</.exec(row)?.[1] ?? '';
      const cue = /_cue_seconds"[^>]*\bvalue="?(\d*)/.exec(row)?.[1] ?? '';
      const kind = match[1] === 'tlpSubTog' ? 'part' : /^w\/$/i.test(number) ? 'with' : 'track';
      rows.push({ kind, start: cue === '' ? null : Number(cue), name: decode(name[1]).replace(/\s+/g, ' ').trim() });
    });
    return rows;
  }

  /** Tracks with a time, each with the names played over it, and the tracks without one. A time of
   *  0 counts only for the first track: past it, 0 is 1001Tracklists' "no time". */
  function tracksOf(rows) {
    const tracks = [];
    const untimed = [];
    let current = null;
    for (const row of rows) {
      if (row.kind === 'part') continue;
      if (row.kind === 'with') {
        current?.with.push(row.name);
        continue;
      }
      current = { start: row.start, name: row.name, with: [] };
      if (row.start !== null && (row.start > 0 || !tracks.length)) tracks.push(current);
      else untimed.push(current);
    }
    return { tracks, untimed };
  }

  /** Encore's lines: "12:34 Artist - Title", with hours throughout when the set runs past one. */
  function format(tracks, { layers = true } = {}) {
    const long = tracks.some((t) => t.start >= 3600);
    const time = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = String(seconds % 60).padStart(2, '0');
      return long ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
    };
    return tracks.map((t) => `${time(t.start)} ${[t.name, ...(layers ? t.with : [])].join(' w/ ')}`).join('\n');
  }

  const doc = root.document;
  if (!doc) return { readRows, tracksOf, format };

  doc.getElementById('encore-1001')?.remove();
  const { tracks, untimed } = tracksOf(readRows(doc.documentElement.outerHTML));
  const layered = tracks.some((t) => t.with.length);

  const el = (tag, style, text) => {
    const node = doc.createElement(tag);
    node.style.cssText = style;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const font = 'font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1f1d1a;letter-spacing:normal;text-transform:none;';
  const panel = el(
    'div',
    `${font}position:fixed;top:16px;right:16px;z-index:2147483647;box-sizing:border-box;width:min(600px,calc(100vw - 32px));max-height:calc(100vh - 32px);display:flex;flex-direction:column;gap:10px;padding:16px;background:#fbfaf7;border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.45);text-align:left;`,
  );
  panel.id = 'encore-1001';
  panel.append(el('strong', `${font}font-size:16px;font-weight:700;`, 'Encore'));
  panel.append(
    el(
      'div',
      font,
      tracks.length
        ? `${tracks.length} tracks with a time, copied for Encore’s paste box.`
        : 'No tracklist with times on this page. Open a tracklist on 1001tracklists.com and click again.',
    ),
  );
  const area = el(
    'textarea',
    'box-sizing:border-box;width:100%;min-height:220px;flex:1;resize:vertical;padding:8px 10px;border:1px solid #cfcac0;border-radius:8px;background:#fff;color:#1f1d1a;font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;',
  );
  area.spellcheck = false;
  panel.append(area);
  let layers = true;
  if (layered) {
    const label = el('label', `${font}display:flex;gap:8px;align-items:center;cursor:pointer;`);
    const box = el('input', 'margin:0;');
    box.type = 'checkbox';
    box.checked = true;
    box.onchange = () => {
      layers = box.checked;
      area.value = format(tracks, { layers });
      void copy();
    };
    label.append(box, doc.createTextNode('Tracks played over another (“w/”) in its title'));
    panel.append(label);
  }
  if (untimed.length) {
    panel.append(el('div', `${font}color:#8a4b12;`, `Left out, no time on 1001Tracklists: ${untimed.map((t) => t.name).join(' · ')}`));
  }
  const status = el('div', `${font}color:#5b574f;min-height:1.45em;`);
  const row = el('div', 'display:flex;gap:8px;justify-content:flex-end;align-items:center;');
  const button = (text, primary) =>
    el(
      'button',
      `${font}cursor:pointer;padding:7px 14px;border-radius:8px;border:1px solid ${primary ? '#1f1d1a' : '#cfcac0'};background:${primary ? '#1f1d1a' : '#fff'};color:${primary ? '#fff' : '#1f1d1a'};font-weight:600;`,
      text,
    );
  const copyButton = button('Copy', true);
  const close = button('Close', false);
  copyButton.onclick = () => void copy();
  close.onclick = () => panel.remove();
  row.append(status, close, copyButton);
  panel.append(row);
  doc.body.append(panel);
  area.value = format(tracks, { layers });

  async function copy() {
    if (!area.value) return;
    try {
      await root.navigator.clipboard.writeText(area.value);
      status.textContent = 'Copied. In Encore: Paste a list, then paste.';
    } catch {
      area.focus();
      area.select();
      area.scrollTop = 0;
      const done = doc.execCommand?.('copy');
      status.textContent = done ? 'Copied. In Encore: Paste a list, then paste.' : 'Select the list and copy it (⌘C or Ctrl+C).';
    }
  }
  void copy();
})(globalThis);
