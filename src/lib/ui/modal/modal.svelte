<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		showCloseButton?: boolean;
		closeOnBackdropClick?: boolean;
		closeOnEscape?: boolean;
	}

	let {
		open = false,
		title = '',
		size = 'md',
		showCloseButton = true,
		closeOnBackdropClick = true,
		closeOnEscape = true,
		children
	}: Props & { children?: any } = $props();

	const dispatch = createEventDispatcher();

	// Size classes mapping
	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl'
	};

	function closeModal() {
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (closeOnBackdropClick && event.target === event.currentTarget) {
			closeModal();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (closeOnEscape && event.key === 'Escape') {
			closeModal();
		}
	}
</script>

{#if open}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<!-- Backdrop with blur effect -->
		<div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
		
		<!-- Modal content -->
		<div 
			class="relative w-full {sizeClasses[size]} transform transition-all duration-200 ease-out"
		>
			<!-- Card container -->
			<div class="bg-white dark:bg-surface-800 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
				<!-- Header -->
				{#if title || showCloseButton}
					<div class="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
						{#if title}
							<h2 class="text-xl font-semibold text-surface-900 dark:text-surface-50">
								{title}
							</h2>
						{:else}
							<div></div>
						{/if}
						
						{#if showCloseButton}
							<button 
								type="button"
								class="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
								onclick={closeModal}
								aria-label="Close modal"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						{/if}
					</div>
				{/if}
				
				<!-- Body -->
				<div class="p-6">
					{@render children?.()}
				</div>
			</div>
		</div>
	</div>
{/if}