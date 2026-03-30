<script lang="ts">
	import type { Entity } from '$lib/api';
	import EntityHighlight from './EntityHighlight.svelte';

	interface Props {
		role: 'user' | 'assistant';
		content: string;
		entities?: Entity[];
	}

	let { role, content, entities }: Props = $props();
</script>

<div class="flex {role === 'user' ? 'justify-end' : 'justify-start'} mb-3">
	<div
		class="max-w-[75%] rounded-2xl px-4 py-2.5 {role === 'user'
			? 'bg-blue-600 text-white'
			: 'bg-gray-100 text-gray-900'}"
	>
		{#if role === 'user' && entities?.length}
			<EntityHighlight text={content} {entities} />
		{:else}
			<p class="whitespace-pre-wrap">{content}</p>
		{/if}
	</div>
</div>
