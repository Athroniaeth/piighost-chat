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

<div class="flex {role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up">
	<div
		class="max-w-[75%] px-4 py-3 text-[15px] leading-relaxed {role === 'user'
			? 'rounded-2xl rounded-br-md bg-ghost-600 text-white'
			: 'rounded-2xl rounded-bl-md border border-gray-200/60 bg-white text-gray-900 shadow-sm'}"
	>
		{#if role === 'user' && entities?.length}
			<EntityHighlight text={content} {entities} />
		{:else}
			<p class="whitespace-pre-wrap">{content}</p>
		{/if}
	</div>
</div>
