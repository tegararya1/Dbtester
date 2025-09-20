import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Theme mode type
export type ThemeMode = 'light' | 'dark';

// Create the theme store
function createThemeStore() {
	// Initialize with light mode by default
	const { subscribe, set, update } = writable<ThemeMode>('light');

	return {
		subscribe,
		
		// Initialize theme on app start
		init: () => {
			if (!browser) return;
			
			const savedMode = localStorage.getItem('mode') as ThemeMode;
			const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			
			const initialMode: ThemeMode = savedMode || (systemPrefersDark ? 'dark' : 'light');
			
			set(initialMode);
			applyTheme(initialMode);
		},
		
		// Toggle between light and dark
		toggle: () => {
			update(mode => {
				const newMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
				applyTheme(newMode);
				return newMode;
			});
		},
		
		// Set specific theme
		setMode: (mode: ThemeMode) => {
			set(mode);
			applyTheme(mode);
		},
		
		// Set to light mode
		setLight: () => {
			set('light');
			applyTheme('light');
		},
		
		// Set to dark mode
		setDark: () => {
			set('dark');
			applyTheme('dark');
		}
	};
}

// Apply theme to DOM and localStorage
function applyTheme(mode: ThemeMode) {
	if (!browser) return;
	
	document.documentElement.setAttribute('data-mode', mode);
	localStorage.setItem('mode', mode);
}

// Export the theme store
export const themeStore = createThemeStore();

// Derived stores for convenience
import { derived } from 'svelte/store';

export const isDark = derived(themeStore, $theme => $theme === 'dark');
export const isLight = derived(themeStore, $theme => $theme === 'light');