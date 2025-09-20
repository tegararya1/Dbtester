<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
    import { ModeToggle } from '$lib/ui/mode-toggle';
	import { Loader, LayoutDashboard, Users, LogOut } from 'lucide-svelte';

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
			icon: LayoutDashboard
		},
		{
			href: '/dashboard/students',
			label: 'Students',
			icon: Users
		}
	];
</script>

{#if shouldShowLoading}
	<!-- Loading screen -->
	<div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
		<div class="text-center">
			<Loader class="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
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
						<item.icon class="w-5 h-5 mr-3 flex-shrink-0" />
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
					<LogOut class="w-4 h-4 mr-2" />
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