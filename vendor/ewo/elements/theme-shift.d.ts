/**
 * Runs `apply` (whatever puts the new theme on the page: `data-theme`, theme-color, canvas colours)
 * under a short blur of the page. Update the picked control at once and leave the page to `apply`.
 * Picks in quick succession share one blur, and each `apply` runs, in order.
 */
export declare function themeShift(apply: () => void): void;
