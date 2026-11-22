import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type ThemeMode } from "@/styles/tokens";

// The theme lives on <html data-theme> (set first by THEME_INIT_SCRIPT). This module is the only
// writer after that; React reads it through useSyncExternalStore, so every reader stays in sync.

const listeners = new Set<() => void>();
const LIGHT_QUERY = "(prefers-color-scheme: light)";

const systemMode = (): ThemeMode => (window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark");

function savedMode(): ThemeMode | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null; // private mode / blocked storage: just follow the system
  }
}

function apply(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  listeners.forEach((notify) => notify());
}

function getMode(): ThemeMode {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  const media = window.matchMedia(LIGHT_QUERY);
  const onSystemChange = () => {
    if (!savedMode()) apply(systemMode());
  };
  // Another tab changed the theme.
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) apply(savedMode() ?? systemMode());
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Not saved, but still switch for this visit.
  }
  apply(mode);
}

/** Current theme. The server always renders "dark" (template default); the client corrects it on hydration. */
export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, getMode, () => "dark");
}
