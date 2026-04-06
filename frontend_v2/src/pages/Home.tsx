import { useState, useEffect, useCallback } from "react";
import { anonymize, streamChat, type Entity } from "../services/api";
import RenameChatModal from "../components/RenameChatModal";
import DeleteMessageModal from "../components/DeleteMessageModal";
import DeleteChatModal from "../components/DeleteChatModal";
import PromptBoxScreen from "../components/PromptBoxScreen";
import ConversationScreen from "../components/ConversationScreen";
import AppSidebar from "../layouts/AppSidebar";
import MobileHeader from "../components/MobileHeader";

interface Chat {
  id: string;
  title: string;
  messages: any[];
}

export type Status = "idle" | "anonymizing" | "reviewing" | "streaming";

export default function Home() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem("all_chats_v3");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [pendingEntities, setPendingEntities] = useState<Entity[]>([]);
  const [pendingMessage, setPendingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [renameData, setRenameData] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteData, setDeleteData] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Persist all chats to localStorage
  useEffect(() => {
    localStorage.setItem("all_chats_v3", JSON.stringify(chats));
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Step 1: User submits → call /api/anonymize → show review
  const handleSend = useCallback(
    async (text?: string) => {
      const content = typeof text === "string" ? text : inputValue;
      if (!content.trim()) {
        setError("Please enter a meaningful message.");
        return;
      }

      let currentChatId = activeChatId;

      // Create new chat if none active
      if (!currentChatId) {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
          messages: [],
        };
        setChats((prev) => [newChat, ...prev]);
        currentChatId = newChat.id;
        setActiveChatId(newChat.id);
      }

      setInputValue("");
      setPendingMessage(content);
      setStatus("anonymizing");

      try {
        const result = await anonymize(content, currentChatId);
        setPendingEntities(result.entities);
        setStatus("reviewing");
      } catch (err) {
        console.error("Anonymize error:", err);
        setError("Erreur lors de l'analyse du message.");
        setStatus("idle");
      }
    },
    [activeChatId, inputValue],
  );

  // Step 2: User validates → add user message + call /api/chat with streaming
  const handleValidate = useCallback(async () => {
    const currentChatId = activeChatId;
    if (!currentChatId || !pendingMessage) return;

    setStatus("streaming");

    const userMessageId = Date.now();
    const aiMessageId = Date.now() + 1;

    // Add user message + empty AI message
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: userMessageId,
                  type: "user",
                  content: pendingMessage,
                  actions: ["copy"],
                },
                {
                  id: aiMessageId,
                  type: "ai",
                  content: "",
                  actions: ["copy"],
                },
              ],
            }
          : c,
      ),
    );

    const messageToSend = pendingMessage;
    setPendingEntities([]);
    setPendingMessage("");

    try {
      for await (const chunk of streamChat(messageToSend, currentChatId)) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === currentChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, content: m.content + chunk }
                      : m,
                  ),
                }
              : c,
          ),
        );
      }
    } catch (err) {
      console.error("Stream error:", err);
      setError("Erreur lors de la réponse du LLM.");
    } finally {
      setStatus("idle");
    }
  }, [activeChatId, pendingMessage]);

  // Cancel: restore input, go back to idle
  const handleCancelReview = useCallback(() => {
    setInputValue(pendingMessage);
    setPendingMessage("");
    setPendingEntities([]);
    setStatus("idle");
  }, [pendingMessage]);

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setInputValue("");
    setStatus("idle");
    setPendingEntities([]);
  };

  const handleDeleteMessage = (id: number) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: chat.messages.filter((m) => m.id !== id) }
          : chat,
      ),
    );
  };

  const handleRename = (id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  };

  const handleEditMessage = (messageId: number, newContent: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: chat.messages.map((m) =>
              m.id === messageId ? { ...m, content: newContent } : m,
            ),
          };
        }
        return chat;
      }),
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

  return (
    <div className="flex h-screen  overflow-hidden">
      <AppSidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onRenameChat={(id, title) => setRenameData({ id, title })}
        onConfirmDeleteChat={(id, title) => setDeleteData({ id, title })}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-hidden relative  font-lexend">
          {!activeChat ? (
            <PromptBoxScreen
              key="prompt-box"
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSend={handleSend}
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
              pendingMessage={pendingMessage}
              onValidate={handleValidate}
              onCancelReview={handleCancelReview}
            />
          )}
          {error && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-xl">
              {error}
            </div>
          )}
        </main>
      </div>

      <RenameChatModal
        isOpen={!!renameData}
        onClose={() => setRenameData(null)}
        currentTitle={renameData?.title || ""}
        onRename={(newTitle: string) => {
          if (renameData) {
            handleRename(renameData.id, newTitle);
          }
        }}
      />

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
