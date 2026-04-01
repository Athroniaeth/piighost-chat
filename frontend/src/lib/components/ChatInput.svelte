<script lang="ts">
	import type { Entity } from '$lib/api';
	import { getEntityColor } from '$lib/constants/colors';

	interface Props {
		disabled?: boolean;
		reviewing?: boolean;
		entities?: Entity[];
		onsubmit: (message: string) => void;
		onvalidate?: () => void;
		oncancel?: () => void;
	}

	let {
		disabled = false,
		reviewing = false,
		entities = [],
		onsubmit,
		onvalidate,
		oncancel
	}: Props = $props();

	let input = $state('');
	let inputEl: HTMLInputElement | undefined = $state();

	function handleSubmit() {
		const trimmed = input.trim();
		if (!trimmed) return;
		onsubmit(trimmed);
		input = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if (reviewing && e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onvalidate?.();
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="px-4 py-4">
	<div class="mx-auto max-w-3xl space-y-3">
		{#if reviewing && entities?.length}
			<div class="animate-slide-up rounded-xl border border-ghost-200/60 bg-ghost-50 p-4">
				<p class="mb-2 text-xs font-medium text-ghost-700">Entités détectées</p>
				<div class="mb-3 flex flex-wrap gap-1.5">
					{#each entities as entity}
						<span
							class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium {getEntityColor(entity.label)}"
						>
							{entity.original_text}
							<span class="opacity-50">{entity.label}</span>
						</span>
					{/each}
				</div>
				<div class="flex gap-2">
					<button
						class="flex-1 rounded-lg bg-ghost-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ghost-700"
						onclick={onvalidate}
					>
						Valider et envoyer
					</button>
					<button
						class="rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
						onclick={oncancel}
					>
						Annuler
					</button>
				</div>
				<p class="mt-2 text-xs text-gray-400">Appuyez sur Entrée pour valider</p>
			</div>
		{/if}

		{#if !reviewing}
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div
					class="flex items-center rounded-xl border border-gray-200/60 bg-white shadow-sm transition-all duration-200 focus-within:border-ghost-300 focus-within:shadow-md"
				>
					<input
						bind:this={inputEl}
						type="text"
						bind:value={input}
						onkeydown={handleKeydown}
						placeholder="Écrivez votre message..."
						class="flex-1 bg-transparent px-4 py-3 text-[15px] placeholder:text-gray-400 focus:outline-none"
						{disabled}
					/>
					<button
						type="submit"
						class="mr-2 rounded-lg bg-ghost-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ghost-700 disabled:opacity-40"
						disabled={disabled || !input.trim()}
					>
						Analyser
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
