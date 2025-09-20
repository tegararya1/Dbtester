export { default as ModeToggle } from './mode-toggle.svelte';

export function applyTheme(dark: boolean) {
    const mode = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('mode', mode);
}