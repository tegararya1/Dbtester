import { onMount } from 'svelte';
import { writable } from 'svelte/store';

/**
 * Hook to detect if the current device is mobile based on window width
 * @param breakpoint - The breakpoint in pixels to consider as mobile (default: 1024px for lg breakpoint)
 * @returns Object containing isMobile store and checkMobile function
 */
export function useMobile(breakpoint: number = 1024) {
	const isMobile = writable(false);

	const checkMobile = () => {
		if (typeof window !== 'undefined') {
			isMobile.set(window.innerWidth < breakpoint);
		}
	};

	onMount(() => {
		checkMobile();

		const handleResize = () => {
			checkMobile();
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	return {
		isMobile,
		checkMobile
	};
}