<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { Users, CheckCircle, TrendingUp, Calendar, Eye, Download, MessageSquare, Plus, BarChart3, Settings } from 'lucide-svelte';

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
						<Users class="w-6 h-6 text-primary-600" />
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
						<CheckCircle class="w-6 h-6 text-success-600" />
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
						<TrendingUp class="w-6 h-6 text-warning-600" />
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
						<CheckCircle class="w-6 h-6 text-success-600" />
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
						<Plus class="w-4 h-4 mr-2" />
						Add New Student
					</button>
					<button class="btn variant-ghost w-full justify-start">
						<BarChart3 class="w-4 h-4 mr-2" />
						Generate Report
					</button>
					<button class="btn variant-ghost w-full justify-start">
						<Settings class="w-4 h-4 mr-2" />
						System Settings
					</button>
				</div>
			</div>
		</div>
	</div>
</div>