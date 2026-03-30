<script lang="ts">
	interface Props {
		disabled?: boolean;
		reviewing?: boolean;
		onsubmit: (message: string) => void;
		onvalidate?: () => void;
		oncancel?: () => void;
	}

	let { disabled = false, reviewing = false, onsubmit, onvalidate, oncancel }: Props = $props();

	let input = $state('');

	function handleSubmit() {
		const trimmed = input.trim();
		if (!trimmed) return;
		onsubmit(trimmed);
		input = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (reviewing && onvalidate) {
				onvalidate();
			} else if (!reviewing) {
				handleSubmit();
			}
		}
	}
</script>

<div class="border-t border-gray-200 bg-white p-4">
	{#if reviewing}
		<div class="flex gap-2">
			<button
				class="flex-1 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white hover:bg-green-700"
				onclick={onvalidate}
			>
				Envoyer au LLM
			</button>
			<button
				class="rounded-lg bg-gray-200 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
				onclick={oncancel}
			>
				Annuler
			</button>
		</div>
	{:else}
		<form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<input
				type="text"
				bind:value={input}
				onkeydown={handleKeydown}
				placeholder="Tapez votre message..."
				class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
				{disabled}
			/>
			<button
				type="submit"
				class="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
				disabled={disabled || !input.trim()}
			>
				Analyser
			</button>
		</form>
	{/if}
</div>
