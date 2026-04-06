const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8001";

export interface Entity {
  label: string;
  original_text: string;
}

export interface AnonymizeResult {
  anonymized_text: string;
  entities: Entity[];
}

export interface Thread {
  id: string;
  title: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export async function anonymize(
  message: string,
  threadId: string,
): Promise<AnonymizeResult> {
  const res = await fetch(`${BACKEND_URL}/api/anonymize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: threadId }),
  });
  if (!res.ok) throw new Error(`Anonymize failed: ${res.status}`);
  return res.json();
}

export async function fetchThreads(): Promise<Thread[]> {
  const res = await fetch(`${BACKEND_URL}/api/threads`);
  if (!res.ok) throw new Error(`Fetch threads failed: ${res.status}`);
  const data = await res.json();
  return data.threads;
}

export async function fetchMessages(threadId: string): Promise<ChatMessage[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/messages?thread_id=${encodeURIComponent(threadId)}`,
  );
  if (!res.ok) throw new Error(`Fetch messages failed: ${res.status}`);
  const data = await res.json();
  return data.messages;
}

export async function deleteThread(threadId: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/threads/${encodeURIComponent(threadId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete thread failed: ${res.status}`);
}

export async function* streamChat(
  message: string,
  threadId: string,
): AsyncGenerator<string> {
  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: threadId }),
  });

  if (!res.ok) {
    throw new Error(`Chat failed: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        yield line.slice(6).replace(/\r$/, "");
      }
    }
  }
}
