<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
    import { ModeToggle } from '$lib/ui/mode-toggle';
	import { Loader, LayoutDashboard, Users, LogOut, PanelLeftOpen, PanelLeftClose, X, Package, Thermometer, FileText } from 'lucide-svelte';
	import { useMobile } from '$lib/hooks';

	let { children } = $props();

	// Reactive authentication state
	let authState = $state($authStore);

	// Mobile detection hook
	const { isMobile } = useMobile();

	// Sidebar state management
	let sidebarOpen = $state(true);

	// Auto-close sidebar on mobile when isMobile changes
	$effect(() => {
		if ($isMobile) {
			sidebarOpen = false;
		}
	});

	// Toggle sidebar
	const toggleSidebar = () => {
		sidebarOpen = !sidebarOpen;
	};

	// Close sidebar (for mobile backdrop)
	const closeSidebar = () => {
		if ($isMobile) {
			sidebarOpen = false;
		}
	};

	onMount(() => {
		const unsubscribe = authStore.subscribe(state => {
			authState = state;
			
			// Only redirect if we have a definitive non-authenticated state
			if (!state.loading && !state.isAuthenticated && !state.token) {
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
		},
		{
			href: '/dashboard/containers',
			label: 'Containers',
			icon: Package
		},
		{
			href: '/dashboard/sensor-data',
			label: 'Sensor Data',
			icon: Thermometer
		},
		{
			href: '/dashboard/reports',
			label: 'Reports',
			icon: FileText
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
		<!-- Backdrop overlay for mobile -->
		{#if $isMobile && sidebarOpen}
			<div 
				class="fixed inset-0 bg-black/50 z-20 lg:hidden"
				onclick={closeSidebar}
				onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
				role="button"
				tabindex="-1"
				aria-label="Close sidebar"
			></div>
		{/if}

		<!-- Sidebar -->
		<div class="
			{sidebarOpen ? 'translate-x-0' : $isMobile ? '-translate-x-full' : 'hidden'}
			{$isMobile ? 'fixed' : 'relative'}
			{sidebarOpen || $isMobile ? 'w-64' : 'w-0'}
			bg-surface-100 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 
			flex flex-col transition-all duration-300 ease-in-out z-30 h-full
			{!sidebarOpen && !$isMobile ? 'border-r-0' : ''}
		">
			<!-- Header -->
			<div class="p-4 border-b border-surface-200 dark:border-surface-700">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-xl font-bold text-surface-900 dark:text-surface-50">Damayanti</h1>
						<p class="text-sm text-surface-600 dark:text-surface-400">Dashboard</p>
					</div>
					{#if $isMobile}
						<button
							onclick={toggleSidebar}
							class="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
							aria-label="Close sidebar"
						>
							<X class="w-5 h-5" />
						</button>
					{/if}
				</div>
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
		<div class="
			flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
			{$isMobile ? 'w-full' : sidebarOpen ? 'ml-0' : 'w-full'}
		">
			<!-- Top bar -->
			<div class="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-6 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<!-- Sidebar toggle button -->
						<button
							onclick={toggleSidebar}
							class="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
							aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
						>
							{#if sidebarOpen}
								<PanelLeftClose class="w-5 h-5" />
							{:else}
								<PanelLeftOpen class="w-5 h-5" />
							{/if}
						</button>
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