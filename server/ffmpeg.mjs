// One ffmpeg run: on a deadline of its own (it's killed, not asked), with its progress in seconds
// of output, and the tail of what it said when it fails.

import { spawn } from 'node:child_process';

export class FfmpegError extends Error {
  constructor(message, tail = '') {
    super(message);
    this.name = 'FfmpegError';
    this.tail = tail;
  }
}

/**
 * @param {string} binary
 * @param {string[]} args  everything after ffmpeg's own flags
 * @param {{ timeoutMs?: number, onSeconds?: (s: number) => void, signal?: AbortSignal }} [options]
 */
export function runFfmpeg(binary, args, { timeoutMs = 30 * 60_000, onSeconds, signal } = {}) {
  return new Promise((resolve, reject) => {
    const progress = onSeconds ? ['-progress', 'pipe:1', '-nostats'] : [];
    const child = spawn(binary, ['-hide_banner', '-nostdin', '-y', ...progress, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let tail = '';
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (error) reject(error);
      else resolve();
    };
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finish(new FfmpegError(`ffmpeg took longer than ${Math.round(timeoutMs / 1000)} s`, tail));
    }, timeoutMs);
    const abort = () => {
      child.kill('SIGKILL');
      finish(new FfmpegError('stopped', tail));
    };
    signal?.addEventListener('abort', abort, { once: true });

    let buffer = '';
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const match = /^out_time_us=(\d+)/.exec(line);
        if (match) onSeconds?.(Number(match[1]) / 1e6);
      }
    });
    child.stderr.on('data', (chunk) => {
      tail = (tail + chunk).slice(-2000);
    });
    child.on('error', (error) => finish(new FfmpegError(error.code === 'ENOENT' ? `ffmpeg not found (${binary})` : error.message, tail)));
    child.on('close', (code) => finish(code === 0 ? null : new FfmpegError(`ffmpeg exited with ${code}`, tail)));
  });
}
