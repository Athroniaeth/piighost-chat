<script lang="ts">
	import type { Entity } from '$lib/api';

	interface Props {
		text: string;
		entities: Entity[];
	}

	let { text, entities }: Props = $props();

	const LABEL_COLORS: Record<string, string> = {
		PERSON: 'bg-blue-200 text-blue-900',
		LOCATION: 'bg-green-200 text-green-900',
		ORGANIZATION: 'bg-purple-200 text-purple-900',
		EMAIL: 'bg-yellow-200 text-yellow-900',
		PHONE_NUMBER: 'bg-orange-200 text-orange-900',
		DATE_OF_BIRTH: 'bg-pink-200 text-pink-900',
		ADDRESS: 'bg-teal-200 text-teal-900',
		CREDIT_CARD: 'bg-red-200 text-red-900',
		IBAN: 'bg-red-200 text-red-900',
		SOCIAL_SECURITY_NUMBER: 'bg-red-200 text-red-900'
	};

	function getColor(label: string): string {
		return LABEL_COLORS[label] ?? 'bg-gray-200 text-gray-900';
	}

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
				class="inline-flex items-center gap-1 rounded px-1 py-0.5 text-sm font-medium {getColor(seg.entity.label)}"
				title={seg.entity.label}
			>
				{seg.text}
				<span class="text-xs opacity-60">{seg.entity.label}</span>
			</span>
		{:else}
			{seg.text}
		{/if}
	{/each}
</span>
