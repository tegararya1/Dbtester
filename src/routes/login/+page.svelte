<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Shield, AlertCircle, Mail, Lock, Loader, LogIn } from 'lucide-svelte';

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
				<Shield class="w-8 h-8" />
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
							<AlertCircle class="w-5 h-5 text-error-400" />
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
								<Mail class="w-5 h-5 text-surface-400 dark:text-surface-500" />
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
								<Lock class="w-5 h-5 text-surface-400 dark:text-surface-500" />
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
							<Loader class="animate-spin h-5 w-5 text-white" />
							<span>Signing in...</span>
						</div>
					{:else}
						<div class="flex items-center justify-center space-x-2">
							<LogIn class="w-5 h-5" />
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
