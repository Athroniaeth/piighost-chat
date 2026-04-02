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
	let textarea: HTMLTextAreaElement | undefined = $state();

	function handleSubmit() {
		const trimmed = input.trim();
		if (!trimmed) return;
		onsubmit(trimmed);
		input = '';
		if (textarea) textarea.style.height = 'auto';
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

	$effect(() => {
		// Auto-resize textarea
		void input;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
		}
	});
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="input-wrapper p-4">
	<div class="mx-auto max-w-3xl space-y-3">
		{#if reviewing && entities?.length}
			<div class="review-banner animate-slide-up rounded-xl p-4">
				<p class="mb-2 text-xs font-medium" style="color: var(--accent-light)">
					Entités détectées
				</p>
				<div class="mb-3 flex flex-wrap gap-1.5">
					{#each entities as entity}
						<span class="{getEntityColor(entity.label)}">
							{entity.original_text}
							<span class="opacity-50">{entity.label}</span>
						</span>
					{/each}
				</div>
				<div class="flex gap-2">
					<button class="btn-accent flex-1" onclick={onvalidate}>Valider et envoyer</button>
					<button class="btn-secondary" onclick={oncancel}>Annuler</button>
				</div>
				<p class="mt-2 text-xs" style="color: var(--text-secondary)">
					Appuyez sur Entrée pour valider
				</p>
			</div>
		{/if}

		{#if !reviewing}
			<div class="input-container flex items-end gap-2 rounded-xl px-3 py-2">
				<!-- Attach button -->
				<button
					class="shrink-0 p-1.5 rounded-lg transition-opacity opacity-50 hover:opacity-80"
					style="color: var(--text-secondary)"
					aria-label="Joindre un fichier"
					disabled
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"
						/>
					</svg>
				</button>

				<textarea
					bind:this={textarea}
					bind:value={input}
					onkeydown={handleKeydown}
					placeholder="Écrivez votre message..."
					class="flex-1 resize-none bg-transparent text-sm outline-none"
					style="color: var(--text-primary); max-height: 200px; min-height: 24px"
					rows="1"
					{disabled}
				></textarea>

				<!-- Send button -->
				<button
					class="send-btn shrink-0 rounded-lg p-1.5 transition-all"
					class:active={!!input.trim()}
					onclick={handleSubmit}
					disabled={disabled || !input.trim()}
					aria-label="Envoyer le message"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="22" y1="2" x2="11" y2="13" />
						<polygon points="22 2 15 22 11 13 2 9 22 2" />
					</svg>
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.input-wrapper {
		border-top: 1px solid var(--border-color);
		background: var(--bg-surface);
	}

	.input-container {
		background: var(--input-bg);
		border: 1px solid var(--border-color);
		transition: border-color 0.2s;
	}

	.input-container:focus-within {
		border-color: var(--accent);
	}

	.review-banner {
		background: var(--bg-surface-elevated);
		border: 1px solid var(--border-color);
	}

	.btn-accent {
		background: var(--accent);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s;
		cursor: pointer;
	}

	.btn-accent:hover {
		background: var(--accent-hover);
	}

	.btn-secondary {
		background: var(--bg-surface);
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s;
		cursor: pointer;
	}

	.btn-secondary:hover {
		background: var(--bg-surface-hover);
	}

	.send-btn {
		color: var(--text-secondary);
	}

	.send-btn.active {
		background: var(--accent);
		color: white;
	}

	.send-btn.active:hover {
		background: var(--accent-hover);
	}
</style>
