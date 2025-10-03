export { default as Navbar } from './navbar.svelte';

export interface NavItem {
	href: string;
	label: string;
	translationKey: string;
}

export const navigationConfig: NavItem[] = [
	{
		href: '/',
		label: 'Home',
		translationKey: 'home'
	},
];