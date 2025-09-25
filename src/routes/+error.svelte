<script lang="ts">
	const { status, message } = $props();
</script>

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center">
	<div class="space-y-8 text-center">
		<div class="flex flex-col items-center justify-center gap-2">
			<h1 class="text-gradient text-8xl font-bold">
				{status}
			</h1>
			<h1 class="text-md font-bold">
				{message === 'Not Found' ? 'Page Not Found' : message}
			</h1>
		</div>
		<a href="/" class="animated-underline inline-block text-lg">&larr; Go back home</a>
	</div>
</div>