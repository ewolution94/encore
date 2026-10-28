// A check's message in the page's language: the shared checks (shared/tracklist.mjs) say what's
// wrong by code; their English text is for the server and the tests.

import type { Issue } from '../../shared/tracklist.mjs';
import { t } from './i18n/index.svelte.ts';

export function issueText(issue: Issue): string {
  switch (issue.code) {
    case 'trim':
      return issue.index === -1 ? t('issue.trim') : t('issue.trimTrack');
    case 'short':
      return t('issue.short', { seconds: 5 });
    default:
      return t(`issue.${issue.code}`);
  }
}
