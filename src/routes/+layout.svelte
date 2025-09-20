<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { themeStore } from '$lib/stores/theme';

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

{@render children?.()}
