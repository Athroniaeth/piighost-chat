<script lang="ts">
	import { tick } from 'svelte';
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
	import LoadingDots from '$lib/components/LoadingDots.svelte';

	let chatContainer: HTMLDivElement | undefined = $state();
	let allEntities: Entity[] = $state([]);
	let hasMessages = $derived($messages.length > 0);

	const suggestions = [
		{ icon: '✉️', text: 'Envoie un email à Jean Dupont à jean.dupont@email.com' },
		{ icon: '🌤️', text: 'Quel temps fait-il à Paris ?' },
		{ icon: '📱', text: 'Mon numéro est 06 12 34 56 78' }
	];

	async function scrollToBottom() {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
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

		const currentMessages = get(messages);
		const lastUserMsg = currentMessages.findLast((m) => m.role === 'user');
		const originalMessage = lastUserMsg?.content ?? '';

		status.set('streaming');
		messages.update((m) => [...m, { role: 'assistant', content: '' }]);

		try {
			for await (const chunk of streamChat(originalMessage, get(threadId))) {
				messages.update((m) => {
					const last = m[m.length - 1];
					return [...m.slice(0, -1), { ...last, content: last.content + chunk }];
				});
				scrollToBottom();
			}
		} catch (err) {
			console.error('Stream error:', err);
		}

		try {
			const dbMessages = await fetchMessages(get(threadId));
			messages.set(
				dbMessages.map((m) => ({
					role: m.role === 'human' ? ('user' as const) : ('assistant' as const),
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

{#if !hasMessages}
	<!-- Landing State -->
	<div class="flex min-h-screen flex-col items-center justify-center px-4 pb-32">
		<div class="mb-12 flex flex-col items-center gap-3 animate-fade-in">
			<h1
				class="bg-gradient-to-r from-ghost-600 to-ghost-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
			>
				piighost
			</h1>
			<p class="text-sm text-gray-500">Chat privé avec anonymisation PII</p>
		</div>

		<div class="flex w-full max-w-2xl flex-col gap-3 sm:flex-row animate-fade-in" style="animation-delay: 0.1s">
			{#each suggestions as suggestion}
				<button
					class="group flex flex-1 cursor-pointer flex-col rounded-xl border border-gray-200/60 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-ghost-200 hover:shadow-md"
					onclick={() => handleSubmit(suggestion.text)}
				>
					<span class="mb-2 text-lg">{suggestion.icon}</span>
					<span class="text-sm text-gray-600 transition-colors group-hover:text-gray-900"
						>{suggestion.text}</span
					>
				</button>
			{/each}
		</div>
	</div>

	<!-- Fixed Bottom Input -->
	<div class="fixed inset-x-0 bottom-0 border-t border-gray-200/40 backdrop-blur-xl bg-white/80">
		<ChatInput
			disabled={!$isIdle}
			reviewing={false}
			onsubmit={handleSubmit}
		/>
	</div>
{:else}
	<!-- Active Chat State -->
	<div class="flex h-screen flex-col">
		<!-- Minimal Header -->
		<header class="flex items-center border-b border-gray-200/40 px-6 py-3">
			<span class="text-sm font-semibold text-ghost-600">piighost</span>
		</header>

		<!-- Messages -->
		<div
			bind:this={chatContainer}
			class="flex-1 overflow-y-auto"
			class:pb-24={!$isReviewing}
			class:pb-48={$isReviewing}
		>
			<div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
				{#each $messages as msg}
					<ChatMessage role={msg.role} content={msg.content} entities={msg.entities} />
				{/each}

				{#if $status === 'anonymizing'}
					<div class="flex justify-start">
						<div class="rounded-2xl rounded-bl-md border border-gray-200/60 bg-white px-4 py-3 shadow-sm">
							<LoadingDots text="Analyse en cours" />
						</div>
					</div>
				{/if}

				{#if $status === 'streaming' && $messages[$messages.length - 1]?.content === ''}
					<div class="flex justify-start">
						<div class="rounded-2xl rounded-bl-md border border-gray-200/60 bg-white px-4 py-3 shadow-sm">
							<LoadingDots />
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Fixed Bottom Input -->
		<div class="fixed inset-x-0 bottom-0 border-t border-gray-200/40 backdrop-blur-xl bg-white/80">
			<ChatInput
				disabled={!$isIdle && !$isReviewing}
				reviewing={$isReviewing}
				entities={$pendingEntities}
				onsubmit={handleSubmit}
				onvalidate={handleValidate}
				oncancel={handleCancel}
			/>
		</div>
	</div>
{/if}
