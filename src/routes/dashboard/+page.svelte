<script lang="ts">
	import { authStore } from '$lib/stores/auth';

	// Reactive authentication state
	let authState = $state($authStore);

	// Subscribe to auth store changes
	authStore.subscribe(state => {
		authState = state;
	});

	// Handle logout
	const handleLogout = () => {
		authStore.logout();
	};
</script>

<svelte:head>
	<title>Dashboard - Damayanti</title>
</svelte:head>

<!-- Main content -->
<div class="p-6">
	<div class="max-w-7xl mx-auto">
		<div class="mb-6">
			<p class="text-surface-600 dark:text-surface-400">
				Welcome to your Damayanti management dashboard
			</p>
		</div>

		<!-- Dashboard cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-surface-600 dark:text-surface-400">Total Students</p>
						<p class="text-2xl font-bold text-surface-900 dark:text-surface-50">--</p>
					</div>
					<div class="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
						<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-surface-600 dark:text-surface-400">Active Containers</p>
						<p class="text-2xl font-bold text-surface-900 dark:text-surface-50">--</p>
					</div>
					<div class="p-3 bg-success-100 dark:bg-success-900 rounded-full">
						<svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					</div>
				</div>
			</div>

			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-surface-600 dark:text-surface-400">Recent Reports</p>
						<p class="text-2xl font-bold text-surface-900 dark:text-surface-50">--</p>
					</div>
					<div class="p-3 bg-warning-100 dark:bg-warning-900 rounded-full">
						<svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-surface-600 dark:text-surface-400">System Status</p>
						<p class="text-2xl font-bold text-success-600">Online</p>
					</div>
					<div class="p-3 bg-success-100 dark:bg-success-900 rounded-full">
						<svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent activity section -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="card p-6">
				<h3 class="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
					Recent Activity
				</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
						<div class="flex items-center">
							<div class="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
							<span class="text-sm text-surface-700 dark:text-surface-300">
								System initialized
							</span>
						</div>
						<span class="text-xs text-surface-500">Now</span>
					</div>
				</div>
			</div>

			<div class="card p-6">
				<h3 class="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
					Quick Actions
				</h3>
				<div class="space-y-3">
					<button class="btn variant-ghost w-full justify-start">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						Add New Student
					</button>
					<button class="btn variant-ghost w-full justify-start">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						Generate Report
					</button>
					<button class="btn variant-ghost w-full justify-start">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						System Settings
					</button>
				</div>
			</div>
		</div>
	</div>
</div>