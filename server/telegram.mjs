// "Ready to check" on Telegram, from the bot that sends Census's deploy messages. Off without its
// two variables (ENCORE_TG_BOT_TOKEN, ENCORE_TG_CHAT_ID). A scan that finds more than a few sets at
// once (the first one after a playlist is added) sends one line for all of them.

import { withDeadline } from './deadline.mjs';

const SINGLE_UP_TO = 3;

const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The message for new sets: `{ id, title, channel, duration, trackCount, sourceLabel }`. */
export function readyMessage(sets, publicUrl) {
  const link = (id) => (publicUrl ? `${publicUrl.replace(/\/$/, '')}/sets/${encodeURIComponent(id)}` : null);
  if (sets.length > SINGLE_UP_TO) {
    const home = publicUrl ? ` <a href="${escape(publicUrl)}">Open Encore</a>` : '';
    return `🎧 <b>${sets.length} sets ready to check</b>.${home}`;
  }
  return sets
    .map((set) => {
      const minutes = Math.round(set.duration / 60);
      const from = set.sourceLabel === 'Description' ? 'the description' : set.sourceLabel.replace(/^Comment by/, 'a comment by');
      const list = set.trackCount ? `${set.trackCount} tracks from ${from}` : 'no tracklist found';
      const title = link(set.id) ? `<a href="${escape(link(set.id))}">${escape(set.title)}</a>` : escape(set.title);
      return `🎧 <b>Ready to check</b>\n${title}\n${escape(set.channel)} · ${minutes} min · ${escape(list)}`;
    })
    .join('\n\n');
}

export function createTelegram({ token, chatId, publicUrl = '', fetcher = fetch, log = console }) {
  if (!token || !chatId) return { enabled: false, notify: async () => {} };
  return {
    enabled: true,
    async notify(sets) {
      if (!sets.length) return;
      try {
        await withDeadline(15_000, async (signal) => {
          const res = await fetcher(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: readyMessage(sets, publicUrl), parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
            signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        });
      } catch (error) {
        // Never the token: Telegram's errors repeat the URL.
        log.warn(`Telegram: not sent (${error.name === 'DeadlineError' ? 'timeout' : String(error.message).replace(token, '…')})`);
      }
    },
  };
}
