<script lang="ts">
	import { get } from 'svelte/store';
	import { fetchMessages } from '$lib/api';
	import { messages, status, threadId, pendingEntities } from '$lib/stores/chat';
	import { conversations } from '$lib/stores/conversations';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ChatArea from '$lib/components/ChatArea.svelte';

	let sidebarOpen = $state(true);

	function newChat() {
		threadId.set(crypto.randomUUID());
		messages.set([]);
		status.set('idle');
		pendingEntities.set([]);
	}

	async function selectConversation(id: string) {
		threadId.set(id);
		status.set('idle');
		pendingEntities.set([]);
		try {
			const dbMessages = await fetchMessages(id);
			messages.set(
				dbMessages.map((m) => ({
					role: m.role === 'human' ? ('user' as const) : ('assistant' as const),
					content: m.content
				}))
			);
		} catch {
			messages.set([]);
		}
		if (typeof window !== 'undefined' && window.innerWidth < 768) sidebarOpen = false;
	}

	function deleteConversation(id: string) {
		conversations.remove(id);
		if (get(threadId) === id) newChat();
	}
</script>

<div class="flex h-screen overflow-hidden" style="background: var(--bg-primary)">
	<Sidebar
		open={sidebarOpen}
		currentThreadId={$threadId}
		onclose={() => (sidebarOpen = false)}
		onnewchat={newChat}
		onselectconversation={selectConversation}
		ondeleteconversation={deleteConversation}
	/>
	<ChatArea ontoggleSidebar={() => (sidebarOpen = !sidebarOpen)} />
</div>
