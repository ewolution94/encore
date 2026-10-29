// The 1001Tracklists bookmarklet (bookmarklet/from-1001tracklists.js) as a bookmark's address, for
// the paste box's link that's dragged to the bookmarks bar.
import source from '../../bookmarklet/from-1001tracklists.js?raw';

/** The code without its comments and indentation, so the address stays short. */
export const from1001Tracklists = `javascript:${encodeURIComponent(
  source
    .replace(/\/\*\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\n\s*/g, '\n')
    .replace(/\n+/g, '\n')
    .trim(),
)}`;
