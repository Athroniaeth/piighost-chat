import { useState, useEffect, useCallback } from "react";
import {
  detect,
  overrideDetections,
  fetchLabels,
  streamChat,
  fetchThreads,
  fetchMessages,
  deleteThread,
  type Entity,
  type DetectionDTO,
  type Thread,
} from "../services/api";
import DeleteMessageModal from "../components/DeleteMessageModal";
import DeleteChatModal from "../components/DeleteChatModal";
import PromptBoxScreen from "../components/PromptBoxScreen";
import ConversationScreen from "../components/ConversationScreen";
import AppSidebar from "../layouts/AppSidebar";
import MobileHeader from "../components/MobileHeader";

interface Message {
  id: number;
  type: string;
  content: string;
  actions: string[];
}

export type Status = "idle" | "anonymizing" | "reviewing" | "streaming";

export default function Home() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [pendingEntities, setPendingEntities] = useState<Entity[]>([]);
  const [pendingDetections, setPendingDetections] = useState<DetectionDTO[]>([]);
  const [originalDetections, setOriginalDetections] = useState<DetectionDTO[]>([]);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [pendingMessage, setPendingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteData, setDeleteData] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null);

  // Load threads from backend on mount
  const refreshThreads = useCallback(async () => {
    try {
      const data = await fetchThreads();
      setThreads(data);
    } catch (err) {
      console.error("Failed to load threads:", err);
    }
  }, []);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  // Load messages from backend when switching chat
  const loadMessages = useCallback(async (threadId: string) => {
    try {
      const data = await fetchMessages(threadId);
      setMessages(
        data.map((m, i) => ({
          id: i,
          type: m.role === "human" ? "user" : "ai",
          content: m.content,
          actions: ["copy"],
        })),
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    }
  }, []);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const activeChat = activeChatId
    ? { id: activeChatId, messages }
    : null;

  // Step 1: User submits → call /api/detect → show review
  const handleSend = useCallback(
    async (text?: string) => {
      const content = typeof text === "string" ? text : inputValue;
      if (!content.trim()) {
        setError("Please enter a meaningful message.");
        return;
      }

      let currentChatId = activeChatId;

      // Create new thread if none active
      if (!currentChatId) {
        currentChatId = Date.now().toString();
        setActiveChatId(currentChatId);
      }

      setInputValue("");
      setPendingMessage(content);
      setStatus("anonymizing");

      // Fetch labels in parallel (best-effort)
      fetchLabels()
        .then(setAvailableLabels)
        .catch(() => {});

      try {
        const result = await detect(content, currentChatId);
        setPendingDetections(result.detections);
        setOriginalDetections(result.detections);
        // Build legacy entities for display compatibility
        setPendingEntities(
          result.detections.map((d) => ({
            label: d.label,
            original_text: d.text,
          })),
        );
        setStatus("reviewing");
      } catch (err) {
        console.error("Detect error:", err);
        setError("Failed to analyze the message.");
        setStatus("idle");
      }
    },
    [activeChatId, inputValue],
  );

  // Step 2: User validates → override detections if changed → send to LLM
  const handleValidate = useCallback(async () => {
    const currentChatId = activeChatId;
    if (!currentChatId || !pendingMessage) return;

    // Override detection cache if user made corrections
    const changed =
      JSON.stringify(pendingDetections) !== JSON.stringify(originalDetections);
    if (changed) {
      try {
        await overrideDetections(pendingMessage, pendingDetections, currentChatId);
      } catch (err) {
        console.error("Override error:", err);
        setError("Failed to save corrections.");
        return;
      }
    }

    setStatus("streaming");

    const userMessageId = Date.now();
    const aiMessageId = Date.now() + 1;

    // Add user message + empty AI message to local state
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, type: "user", content: pendingMessage, actions: ["copy"] },
      { id: aiMessageId, type: "ai", content: "", actions: ["copy"] },
    ]);

    const messageToSend = pendingMessage;
    setPendingEntities([]);
    setPendingDetections([]);
    setOriginalDetections([]);
    setPendingMessage("");

    try {
      for await (const chunk of streamChat(messageToSend, currentChatId)) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch (err) {
      console.error("Stream error:", err);
      setError("Failed to get the LLM response.");
    } finally {
      setStatus("idle");
      // Reload deanonymized messages from backend + refresh thread list
      const [msgs] = await Promise.all([
        fetchMessages(currentChatId),
        refreshThreads(),
      ]);
      setMessages(
        msgs.map((m, i) => ({
          id: i,
          type: m.role === "human" ? "user" : "ai",
          content: m.content,
          actions: ["copy"],
        })),
      );
    }
  }, [
    activeChatId,
    pendingMessage,
    pendingDetections,
    originalDetections,
    refreshThreads,
  ]);

  // Cancel: restore input, go back to idle
  const handleCancelReview = useCallback(() => {
    setInputValue(pendingMessage);
    setPendingMessage("");
    setPendingEntities([]);
    setPendingDetections([]);
    setOriginalDetections([]);
    setStatus("idle");
  }, [pendingMessage]);

  const handleDeleteChat = useCallback(
    async (id: string) => {
      try {
        await deleteThread(id);
      } catch (err) {
        console.error("Failed to delete thread:", err);
      }
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (activeChatId === id) {
        setActiveChatId(null);
        setMessages([]);
      }
    },
    [activeChatId],
  );

  const handleSelectChat = useCallback(
    (id: string) => {
      setActiveChatId(id);
      setStatus("idle");
      setPendingEntities([]);
      setPendingMessage("");
      loadMessages(id);
      if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
    },
    [loadMessages],
  );

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInputValue("");
    setStatus("idle");
    setPendingEntities([]);
    setPendingDetections([]);
    setOriginalDetections([]);
    setPendingMessage("");
  };

  const handleDeleteMessage = (id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEditMessage = (messageId: number, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, content: newContent } : m)),
    );
  };

  // Close mobile sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isThinking = status === "anonymizing" || status === "streaming";

  // Map threads to ChatItem format for sidebar
  const sidebarChats = threads.map((t) => ({ id: t.id, title: t.title }));

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        chats={sidebarChats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onConfirmDeleteChat={(id, title) => setDeleteData({ id, title })}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-hidden relative font-lexend">
          {!activeChat ? (
            <PromptBoxScreen
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSend={handleSend}
              status={status}
              pendingEntities={pendingEntities}
              pendingDetections={pendingDetections}
              availableLabels={availableLabels}
              pendingMessage={pendingMessage}
              onValidate={handleValidate}
              onCancelReview={handleCancelReview}
              onRemoveDetection={(det) => {
                setPendingDetections((prev) =>
                  prev.filter(
                    (d) =>
                      !(d.start_pos === det.start_pos && d.end_pos === det.end_pos && d.label === det.label),
                  ),
                );
                setPendingEntities((prev) =>
                  prev.filter(
                    (e) => !(e.original_text === det.text && e.label === det.label),
                  ),
                );
              }}
              onAddDetection={(det) => {
                setPendingDetections((prev) =>
                  [...prev, det].sort((a, b) => a.start_pos - b.start_pos),
                );
                setPendingEntities((prev) => [
                  ...prev,
                  { label: det.label, original_text: det.text },
                ]);
              }}
            />
          ) : (
            <ConversationScreen
              key={activeChatId}
              messages={activeChat.messages}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSend={handleSend}
              isThinking={isThinking}
              onEditMessage={handleEditMessage}
              onDeleteMessage={(id: number) => setDeleteMessageId(id)}
              status={status}
              pendingEntities={pendingEntities}
              pendingDetections={pendingDetections}
              availableLabels={availableLabels}
              pendingMessage={pendingMessage}
              onValidate={handleValidate}
              onCancelReview={handleCancelReview}
              onRemoveDetection={(det) => {
                setPendingDetections((prev) =>
                  prev.filter(
                    (d) =>
                      !(d.start_pos === det.start_pos && d.end_pos === det.end_pos && d.label === det.label),
                  ),
                );
                setPendingEntities((prev) =>
                  prev.filter(
                    (e) => !(e.original_text === det.text && e.label === det.label),
                  ),
                );
              }}
              onAddDetection={(det) => {
                setPendingDetections((prev) =>
                  [...prev, det].sort((a, b) => a.start_pos - b.start_pos),
                );
                setPendingEntities((prev) => [
                  ...prev,
                  { label: det.label, original_text: det.text },
                ]);
              }}
            />
          )}
          {error && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-xl">
              {error}
            </div>
          )}
        </main>
      </div>

      <DeleteChatModal
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        chatTitle={deleteData?.title || ""}
        onConfirm={() => {
          if (deleteData) {
            handleDeleteChat(deleteData.id);
          }
        }}
      />

      <DeleteMessageModal
        isOpen={deleteMessageId !== null}
        onClose={() => setDeleteMessageId(null)}
        onConfirm={() => {
          if (deleteMessageId !== null) {
            handleDeleteMessage(deleteMessageId);
          }
        }}
      />
    </div>
  );
}
