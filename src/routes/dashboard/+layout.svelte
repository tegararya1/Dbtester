<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
    import { ModeToggle } from '$lib/ui/mode-toggle';

	let { children } = $props();

	// Reactive authentication state
	let authState = $state($authStore);

	onMount(() => {
		const unsubscribe = authStore.subscribe(state => {
			authState = state;
			
			// Redirect to login if not authenticated and not loading
			if (!state.isAuthenticated && !state.loading) {
				goto('/login');
			}
		});

		return unsubscribe;
	});

	// Variables to control rendering
	const shouldShowLoading = $derived(authState.loading);
	const shouldShowDashboard = $derived(authState.isAuthenticated && !authState.loading);

	// Handle logout
	const handleLogout = () => {
		authStore.logout();
	};

	// Navigation items
	const navItems = [
		{
			href: '/dashboard',
			label: 'Overview',
			icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z'
		},
		{
			href: '/dashboard/students',
			label: 'Students',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
		},
		{
			href: '/dashboard/containers',
			label: 'Containers',
			icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
		},
		{
			href: '/dashboard/reports',
			label: 'Reports',
			icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
		}
	];
</script>

{#if shouldShowLoading}
	<!-- Loading screen -->
	<div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
		<div class="text-center">
			<svg class="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<p class="text-surface-600 dark:text-surface-400">Loading...</p>
		</div>
	</div>
{:else if shouldShowDashboard}
	<!-- Dashboard layout with sidebar -->
	<div class="h-screen flex bg-surface-50 dark:bg-surface-900">
		<!-- Sidebar -->
		<div class="w-64 bg-surface-100 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 flex flex-col">
			<!-- Header -->
			<div class="p-4 border-b border-surface-200 dark:border-surface-700">
				<h1 class="text-xl font-bold text-surface-900 dark:text-surface-50">Damayanti</h1>
				<p class="text-sm text-surface-600 dark:text-surface-400">Dashboard</p>
			</div>
			
			<!-- Navigation -->
			<nav class="flex-1 p-4 space-y-2">
				<h2 class="text-sm font-semibold mb-4 text-surface-700 dark:text-surface-300 uppercase tracking-wider">
					Navigation
				</h2>
				
				{#each navItems as item}
					<a 
						href={item.href}
						class="flex items-center px-4 py-2.5 rounded-lg transition-colors group
							{page.url.pathname === item.href 
								? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100' 
								: 'text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 hover:text-surface-900 dark:hover:text-surface-100'
							}"
					>
						<svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
						</svg>
						<span class="font-medium">{item.label}</span>
					</a>
				{/each}
			</nav>

			<!-- User section -->
			<div class="p-4 border-t border-surface-200 dark:border-surface-700">
				{#if authState.user}
					<div class="flex items-center mb-3">
						<div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
							<span class="text-sm font-bold text-white">
								{authState.user.full_name.charAt(0).toUpperCase()}
							</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">
								{authState.user.full_name}
							</p>
							<p class="text-xs text-surface-600 dark:text-surface-400 truncate">
								{authState.user.email}
							</p>
						</div>
					</div>
				{/if}
				
				<button 
					class="w-full btn variant-ghost-surface flex items-center justify-center"
					onclick={handleLogout}
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					Logout
				</button>
			</div>
		</div>

		<!-- Main content area -->
		<div class="flex-1 flex flex-col overflow-hidden">
			<!-- Top bar -->
			<div class="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-6 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">
							{#if page.url.pathname === '/dashboard'}
								Dashboard
							{:else if page.url.pathname === '/dashboard/students'}
								Students
							{:else if page.url.pathname === '/dashboard/containers'}
								Containers
							{:else if page.url.pathname === '/dashboard/reports'}
								Reports
							{:else}
								Dashboard
							{/if}
						</h1>
					</div>
					
					<!-- Quick actions -->
					<div class="flex items-center space-x-4">
						<ModeToggle />
					</div>
				</div>
			</div>

			<!-- Page content -->
			<div class="flex-1 overflow-auto">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}