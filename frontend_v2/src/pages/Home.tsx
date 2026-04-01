import { useState, useEffect, useCallback } from "react";
import { streamChat } from "../services/api";
import SearchModal from "../components/SearchModal";
import RenameChatModal from "../components/RenameChatModal";
import RenameProjectModal from "../components/RenameProjectModal";
import DeleteMessageModal from "../components/DeleteMessageModal";
import DeleteChatModal from "../components/DeleteChatModal";
import DeleteProjectModal from "../components/DeleteProjectModal";
import LogoutModal from "../components/LogoutModal";
import SettingsModal from "../components/SettingsModal";
import PromptBoxScreen from "../components/PromptBoxScreen";
import ConversationScreen from "../components/ConversationScreen";
import AppSidebar from "../layouts/AppSidebar";
import MobileHeader from "../components/MobileHeader";

interface Chat {
  id: string;
  title: string;
  messages: any[];
}

export default function Home() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem("all_chats_v3");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "demo-1",
        title: "Getting Started Conversation",
        messages: [
          {
            id: 1,
            type: "user",
            content: "What do you think about the future of AI?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "The future of AI is incredibly promising, with potential breakthroughs in healthcare, education, and sustainability. However, it also requires careful ethical consideration...",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "demo-2",
        title: "AI Inspirations",
        messages: [
          {
            id: 1,
            type: "user",
            content: "Is remote work here to stay?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "Remote work has fundamentally shifted how companies operate. While some are returning to offices, hybrid models are becoming the new standard for many knowledge-based industries...",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "demo-3",
        title: "Analytics Report",
        messages: [
          {
            id: 1,
            type: "user",
            content: "Tell me about sustainable fashion.",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "Sustainable fashion focuses on reducing the environmental impact of clothing production and ensuring fair labor practices throughout the supply chain...",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "pj-1",
        title: "Project Overview",
        messages: [
          {
            id: 1,
            type: "user",
            content: "Can you give me an overview of Project Pimjo?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "Project Pimjo is focused on developing a next-generation AI chat interface that prioritizes performance and user experience. Currently, we are in the prototyping phase...",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "mk-1",
        title: "The Future of AI and Its Impact on Society",
        messages: [
          {
            id: 1,
            type: "user",
            content: "How will AI affect the workforce?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "AI will likely automate routine tasks but also create new roles focused on AI management, ethics, and human-AI collaboration. The key will be reskilling and adaptation...",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "ta-1",
        title: "Dashboard v2",
        messages: [
          {
            id: 1,
            type: "user",
            content: "What are the new features in Dashboard v2?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "Dashboard v2 includes advanced analytics, real-time data fetching, and a more intuitive layout designed for better accessibility and data visualization.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "pj-2",
        title: "Marketing Assets",
        messages: [
          {
            id: 1,
            type: "user",
            content: "Do we have the final banners for the campaign?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "Yes, the design team has uploaded the final banners to the shared drive. I can help you review the dimensions if needed.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "pj-3",
        title: "Q1 Strategy",
        messages: [
          {
            id: 1,
            type: "user",
            content: "What is our primary goal for Q1?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "Our primary goal is to increase user retention by 15% through improved onboarding and personalized recommendation trails.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "mk-2",
        title: "Sustainable Fashion: Trends and Innovations",
        messages: [
          {
            id: 1,
            type: "user",
            content: "What are the latest innovations in sustainable fabrics?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "We're seeing great progress with mushroom leather, recycled ocean plastics, and bio-engineered silk that mimics traditional textures without the environmental cost.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "fb-1",
        title: "Form Components",
        messages: [
          {
            id: 1,
            type: "user",
            content: "Is the new date picker component ready?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "The date picker is in the final testing phase. It now supports multi-range selection and custom holiday highlights.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "fb-2",
        title: "Landing Page Design",
        messages: [
          {
            id: 1,
            type: "user",
            content: "How is the hero section looking?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "The hero section looks great. We've implemented a subtle parallax effect and a clearer call-to-action button color for better conversion.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "fb-3",
        title: "API Documentation",
        messages: [
          {
            id: 1,
            type: "user",
            content: "When will the v3 documentation be live?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "V3 docs are scheduled to go live next Tuesday. We're just finishing up some interactive code examples for the new endpoints.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "fb-4",
        title: "Feedback Loop",
        messages: [
          {
            id: 1,
            type: "user",
            content: "Any interesting user feedback this week?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "Users are loving the new dark mode! One suggestion that kept popping up was adding a keyboard shortcut for quick-switching between projects.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "ta-2",
        title: "User Permissions",
        messages: [
          {
            id: 1,
            type: "user",
            content: "Can we simplify the admin role settings?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "The permissions system now supports role-based blueprints, which makes setting up new admin accounts much faster and less error-prone.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
      {
        id: "ta-3",
        title: "Analytics Integration",
        messages: [
          {
            id: 1,
            type: "user",
            content: "Are the Mixpanel events tracking correctly?",
            actions: ["copy", "edit"],
          },
          {
            id: 2,
            type: "ai",
            content:
              "Yes, the data flow is healthy. We're seeing real-time event ingestion for all major user actions in the dashboard.",
            actions: ["copy", "regenerate", "thumbs_up", "thumbs_down", "more"],
          },
        ],
      },
    ];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [renameData, setRenameData] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [renameProjectData, setRenameProjectData] = useState<{
    name: string;
  } | null>(null);
  const [deleteData, setDeleteData] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteProjectData, setDeleteProjectData] = useState<{
    name: string;
  } | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "account" | "preference" | "plan" | "resources"
  >("account");

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

  const activeChat =
    chats.find((c) => c.id === activeChatId) ||
    (activeChatId
      ? {
          id: activeChatId,
          title: "Project Conversation",
          messages: [
            {
              id: 1,
              type: "ai",
              content:
                "This workspace conversation is ready. How can I help you today?",
              actions: [],
            },
          ],
        }
      : null);

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

      const newMessage = {
        id: Date.now(),
        type: "user",
        content: content,
        actions: ["copy", "edit"],
      };

      const aiMessageId = Date.now() + 1;

      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? { ...c, messages: [...c.messages, newMessage] }
            : c,
        ),
      );
      setInputValue("");
      setIsThinking(true);

      // Add empty AI message that will be filled by streaming
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: aiMessageId,
                    type: "ai",
                    content: "",
                    actions: [
                      "copy",
                      "regenerate",
                      "thumbs_up",
                      "thumbs_down",
                      "more",
                    ],
                  },
                ],
              }
            : c,
        ),
      );

      try {
        for await (const chunk of streamChat(content, currentChatId)) {
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
        setIsThinking(false);
      }
    },
    [activeChatId, inputValue],
  );

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  const handleRenameProject = (oldName: string, newName: string) => {
    console.log(`Renaming project from ${oldName} to ${newName}`);
  };

  const handleDeleteProject = (name: string) => {
    console.log("Deleting project:", name);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setInputValue("");
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
        onOpenSearch={() => setIsSearchOpen(true)}
        onRenameChat={(id, title) => setRenameData({ id, title })}
        onRenameProject={(name: string) => setRenameProjectData({ name })}
        onConfirmDeleteChat={(id, title) => setDeleteData({ id, title })}
        onConfirmDeleteProject={(name: string) =>
          setDeleteProjectData({ name })
        }
        onLogout={() => setIsLogoutOpen(true)}
        onOpenSettings={(tab) => {
          setSettingsTab(tab || "account");
          setTimeout(() => setIsSettingsOpen(true), 0);
        }}
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
              onDeleteChat={() =>
                setDeleteData({ id: activeChat.id, title: activeChat.title })
              }
              onRenameChat={() =>
                setRenameData({ id: activeChat.id, title: activeChat.title })
              }
              onEditMessage={handleEditMessage}
              onDeleteMessage={(id: number) => setDeleteMessageId(id)}
            />
          )}
          {error && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-xl">
              {error}
            </div>
          )}
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

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

      <RenameProjectModal
        isOpen={!!renameProjectData}
        onClose={() => setRenameProjectData(null)}
        currentName={renameProjectData?.name || ""}
        onRename={(newName) => {
          if (renameProjectData) {
            handleRenameProject(renameProjectData.name, newName);
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

      <DeleteProjectModal
        isOpen={!!deleteProjectData}
        onClose={() => setDeleteProjectData(null)}
        projectName={deleteProjectData?.name || ""}
        onConfirm={() => {
          if (deleteProjectData) {
            handleDeleteProject(deleteProjectData.name);
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

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          console.log("Logged out");
          // Here you would typically clear tokens and redirect to login
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
      />
    </div>
  );
}
