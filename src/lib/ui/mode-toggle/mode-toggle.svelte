<script lang="ts">
	import { themeStore, isDark } from '$lib/stores/theme';
	import { Moon, Sun } from 'lucide-svelte';
</script>

<button 
	onclick={() => themeStore.toggle()}
	class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-surface-200 dark:hover:bg-surface-700"
	aria-label="Toggle theme"
>
	{#if $isDark}
		<Moon class="w-5 h-5 text-surface-600 dark:text-surface-400" />
	{:else}
		<Sun class="w-5 h-5 text-yellow-500" />
	{/if}
</button>
