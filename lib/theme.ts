/** Theme catalog shared by the ThemeSwitcher and the no-flash inline script. */

export interface ThemeDef {
  id: string;
  name: string;
  /** Representative accent (for the switcher swatch) as an rgb() string. */
  swatch: string;
}

export const THEMES: ThemeDef[] = [
  { id: "matrix", name: "Matrix Green", swatch: "rgb(0 255 128)" },
  { id: "cyber", name: "Cyber Blue", swatch: "rgb(34 211 238)" },
  { id: "neon", name: "Neon Purple", swatch: "rgb(168 85 247)" },
  { id: "blood", name: "Blood Red", swatch: "rgb(244 63 94)" },
];

export const DEFAULT_THEME = "matrix";
export const THEME_STORAGE_KEY = "aegis-theme";

/**
 * Inline script injected before paint to apply the saved theme and avoid a
 * flash of the wrong colors. Kept as a string so it can run in <head>.
 */
export const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'${DEFAULT_THEME}';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`;
