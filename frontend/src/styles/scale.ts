/** Template px → signed-in UI size that follows the screen (0.9–1×, see `--s` in GlobalStyles). */
export const s = (px: number) => `calc(${px} * var(--s, 1px))`;
