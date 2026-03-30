<script lang="ts">
	import { get } from 'svelte/store';
	import { anonymize, fetchMessages, streamChat, type Entity } from '$lib/api';
	import {
		messages,
		status,
		threadId,
		pendingEntities,
		isIdle,
		isReviewing
	} from '$lib/stores/chat';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';

	let chatContainer: HTMLDivElement;
	let allEntities: Entity[] = $state([]);

	function scrollToBottom() {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	async function handleSubmit(message: string) {
		status.set('anonymizing');

		try {
			const result = await anonymize(message, get(threadId));
			pendingEntities.set(result.entities);

			messages.update((m) => [
				...m,
				{
					role: 'user',
					content: message,
					entities: result.entities,
					anonymized: result.anonymized_text
				}
			]);
			status.set('reviewing');
		} catch (err) {
			console.error('Anonymize error:', err);
			status.set('idle');
		}

		scrollToBottom();
	}

	async function handleValidate() {
		const entities = get(pendingEntities);
		allEntities = [...allEntities, ...entities];

		// Get the original user message (last user message in the list)
		const currentMessages = get(messages);
		const lastUserMsg = currentMessages.findLast((m) => m.role === 'user');
		const originalMessage = lastUserMsg?.content ?? '';

		status.set('streaming');
		messages.update((m) => [...m, { role: 'assistant', content: '' }]);

		try {
			for await (const chunk of streamChat(originalMessage, get(threadId))) {
				messages.update((m) => {
					const last = m[m.length - 1];
					return [
						...m.slice(0, -1),
						{ ...last, content: last.content + chunk }
					];
				});
				scrollToBottom();
			}
		} catch (err) {
			console.error('Stream error:', err);
		}

		// Re-fetch messages from DB to get the final state
		try {
			const dbMessages = await fetchMessages(get(threadId));
			messages.set(
				dbMessages.map((m) => ({
					role: m.role === 'human' ? 'user' as const : 'assistant' as const,
					content: m.content
				}))
			);
		} catch (err) {
			console.error('Fetch messages error:', err);
		}

		status.set('idle');
		scrollToBottom();
	}

	function handleCancel() {
		messages.update((m) => m.slice(0, -1));
		status.set('idle');
	}
</script>

<div class="flex h-screen flex-col bg-white">
	<!-- Header -->
	<header class="border-b border-gray-200 bg-white px-6 py-4">
		<h1 class="text-xl font-semibold text-gray-900">piighost-chat</h1>
		<p class="text-sm text-gray-500">Chat avec anonymisation PII</p>
	</header>

	<!-- Messages -->
	<div bind:this={chatContainer} class="flex-1 overflow-y-auto px-6 py-4">
		{#each $messages as msg}
			<ChatMessage role={msg.role} content={msg.content} entities={msg.entities} />
		{/each}

		{#if $status === 'anonymizing'}
			<div class="mb-3 flex justify-center">
				<span class="text-sm text-gray-400">Analyse en cours...</span>
			</div>
		{/if}
	</div>

	<!-- Input -->
	<ChatInput
		disabled={!$isIdle && !$isReviewing}
		reviewing={$isReviewing}
		onsubmit={handleSubmit}
		onvalidate={handleValidate}
		oncancel={handleCancel}
	/>
</div>
