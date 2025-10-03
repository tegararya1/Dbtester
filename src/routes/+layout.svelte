<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import Error from './+error.svelte';
	import { page } from '$app/state';
	import { Toaster } from 'svelte-sonner';
	import { themeStore } from '$lib/stores/theme';
	import Navbar from '$lib/ui/navbar/navbar.svelte';

	let { children } = $props();

	onMount(() => {
		// Initialize theme store
		themeStore.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		const mode = localStorage.getItem('mode') || 'light';
		document.documentElement.setAttribute('data-mode', mode);
	</script>
</svelte:head>

<Toaster position="bottom-right" expand={true} richColors closeButton />

{#if page.error?.message}
	<Error status={page.status} message={page.error.message} />
{:else}
	{#if !page.url.pathname.startsWith('/dashboard')}
		<Navbar />
	{/if}
	{@render children?.()}
{/if}
