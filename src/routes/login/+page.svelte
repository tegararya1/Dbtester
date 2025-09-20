<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Form state using $state
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	// Reactive authentication state
	let authState = $state($authStore);

	// Subscribe to auth store changes
	onMount(() => {
		const unsubscribe = authStore.subscribe(state => {
			authState = state;
			
			// Redirect if already authenticated
			if (state.isAuthenticated && !state.loading) {
				goto('/dashboard');
			}
		});

		return unsubscribe;
	});

	// Form validation
	const isFormValid = $derived(() => {
		return email.trim() !== '' && 
		       password.trim() !== '' && 
		       email.includes('@') && 
		       password.length >= 6;
	});

	// Handle form submission
	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		
		if (!isFormValid) {
			error = 'Please fill in all fields correctly';
			return;
		}

		loading = true;
		error = '';

		const result = await authStore.login({ email, password });
		
		loading = false;
		
		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || 'Login failed';
		}
	};
</script>

<svelte:head>
	<title>Login - Damayanti Dashboard</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 px-4 py-12">
	<div class="w-full max-w-md">
		<!-- Logo/Brand Section -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 text-white rounded-2xl mb-4 shadow-lg">
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold text-surface-900 dark:text-surface-50">Damayanti</h2>
		</div>

		<!-- Login Card -->
		<div class="card p-8 shadow-2xl border-0 bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">
					Welcome Back
				</h1>
				<p class="text-surface-600 dark:text-surface-400">
					Sign in to access your dashboard
				</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-6">
				{#if error}
					<div class="alert variant-filled-error rounded-xl border-l-4 border-error-600">
						<div class="flex items-center space-x-3">
							<svg class="w-5 h-5 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p class="font-medium">{error}</p>
						</div>
					</div>
				{/if}

				<div class="space-y-5">
					<!-- Email Field -->
					<div class="space-y-2">
						<label class="block text-sm font-semibold text-surface-700 dark:text-surface-300">
							Email Address
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg class="w-5 h-5 text-surface-400 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
								</svg>
							</div>
							<input 
								bind:value={email}
								type="email"
								placeholder="Enter your email"
								class="input pl-10 rounded-xl border-2 border-surface-300 dark:border-surface-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors duration-200"
								required
								disabled={loading}
							/>
						</div>
					</div>

					<!-- Password Field -->
					<div class="space-y-2">
						<label class="block text-sm font-semibold text-surface-700 dark:text-surface-300">
							Password
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg class="w-5 h-5 text-surface-400 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
								</svg>
							</div>
							<input 
								bind:value={password}
								type="password"
								placeholder="Enter your password"
								class="input pl-10 rounded-xl border-2 border-surface-300 dark:border-surface-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors duration-200"
								required
								disabled={loading}
							/>
						</div>
					</div>
				</div>

				<!-- Login Button -->
				<button 
					type="submit" 
					class="btn variant-filled-primary w-full rounded-xl py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:shadow-lg"
					disabled={!isFormValid || loading}
				>
					{#if loading}
						<div class="flex items-center justify-center space-x-2">
							<svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span>Signing in...</span>
						</div>
					{:else}
						<div class="flex items-center justify-center space-x-2">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
							</svg>
							<span>Sign In</span>
						</div>
					{/if}
				</button>

			</form>
		</div>

		<!-- Footer -->
		<div class="text-center mt-8">
			<p class="text-sm text-surface-500 dark:text-surface-400">
				© 2025 Damayanti. All rights reserved.
			</p>
		</div>
	</div>
</div>
