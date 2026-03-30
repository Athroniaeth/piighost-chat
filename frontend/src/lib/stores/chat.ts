import { writable, derived } from 'svelte/store';
import type { Entity } from '$lib/api';

export type Status = 'idle' | 'anonymizing' | 'reviewing' | 'streaming';

export interface Message {
	role: 'user' | 'assistant';
	content: string;
	entities?: Entity[];
	anonymized?: string;
}

export const messages = writable<Message[]>([]);
export const status = writable<Status>('idle');
export const threadId = writable<string>(crypto.randomUUID());
export const pendingAnonymized = writable<string>('');
export const pendingEntities = writable<Entity[]>([]);

export const isIdle = derived(status, ($s) => $s === 'idle');
export const isReviewing = derived(status, ($s) => $s === 'reviewing');
export const isStreaming = derived(status, ($s) => $s === 'streaming');
