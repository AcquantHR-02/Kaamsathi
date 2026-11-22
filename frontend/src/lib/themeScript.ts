import { THEME_STORAGE_KEY } from "@/styles/tokens";

/**
 * Runs in <head> before the first paint: picks the saved theme (or the system one) and sets
 * <html data-theme>. Without it, light-mode users would see a dark flash on every page load.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var m=p==="light"||p==="dark"?p:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=m;}catch(e){document.documentElement.dataset.theme="dark";}})();`;
