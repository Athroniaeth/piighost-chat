<script lang="ts">
	import type { Entity } from '$lib/api';
	import { getEntityColor } from '$lib/constants/colors';

	interface Props {
		text: string;
		entities: Entity[];
	}

	let { text, entities }: Props = $props();

	interface Segment {
		text: string;
		entity?: Entity;
	}

	function buildSegments(text: string, entities: Entity[]): Segment[] {
		if (!entities.length) return [{ text }];

		const sorted = [...entities].sort((a, b) => {
			const ai = text.toLowerCase().indexOf(a.original_text.toLowerCase());
			const bi = text.toLowerCase().indexOf(b.original_text.toLowerCase());
			return ai - bi;
		});

		const segments: Segment[] = [];
		let cursor = 0;

		for (const entity of sorted) {
			const idx = text.toLowerCase().indexOf(entity.original_text.toLowerCase(), cursor);
			if (idx === -1) continue;

			if (idx > cursor) {
				segments.push({ text: text.slice(cursor, idx) });
			}
			segments.push({ text: text.slice(idx, idx + entity.original_text.length), entity });
			cursor = idx + entity.original_text.length;
		}

		if (cursor < text.length) {
			segments.push({ text: text.slice(cursor) });
		}

		return segments;
	}

	let segments = $derived(buildSegments(text, entities));
</script>

<span>
	{#each segments as seg}
		{#if seg.entity}
			<span
				class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium {getEntityColor(seg.entity.label)}"
				title={seg.entity.label}
			>
				{seg.text}
				<span class="opacity-60">{seg.entity.label}</span>
			</span>
		{:else}
			{seg.text}
		{/if}
	{/each}
</span>
