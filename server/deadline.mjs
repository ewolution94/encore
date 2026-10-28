// Work that settles within `timeoutMs`, one way or the other — on our clock. Clinch's
// server/src/deadline.ts in plain JavaScript, with its error given a class of its own and an
// optional outer signal.
//
// The signal handed to `work` is the polite half: it asks `fetch` to drop the request. It is not
// the guarantee. On 2026-10-09 one of Clinch's polls never settled at all, although its request
// had been aborted after 12 seconds: no result, no error, no timeout, and everything that waited
// on it waited with it for two days. The race below rejects at the deadline whatever `work` does,
// and if `work` turns up afterwards its answer goes nowhere.

/** The deadline passed before the work settled. */
export class DeadlineError extends Error {
  /** @param {number} timeoutMs */
  constructor(timeoutMs) {
    super(`no answer within ${timeoutMs}ms`);
    this.name = 'DeadlineError';
  }
}

/**
 * @template T
 * @param {number} timeoutMs
 * @param {(signal: AbortSignal) => Promise<T>} work
 * @param {AbortSignal} [outer]  ends the work early too, with its reason: a request inside a
 *   refresh that has been stopped gives up at once instead of at its own deadline
 * @returns {Promise<T>}
 */
export function withDeadline(timeoutMs, work, outer) {
  const controller = new AbortController();
  let timer;
  let stop;
  const deadline = new Promise((_resolve, reject) => {
    const end = (error) => {
      controller.abort(error);
      reject(error);
    };
    timer = setTimeout(() => end(new DeadlineError(timeoutMs)), timeoutMs);
    if (outer) {
      stop = () => end(outer.reason);
      if (outer.aborted) stop();
      else outer.addEventListener('abort', stop, { once: true });
    }
  });
  return Promise.race([work(controller.signal), deadline]).finally(() => {
    clearTimeout(timer);
    if (stop) outer?.removeEventListener('abort', stop);
  });
}
