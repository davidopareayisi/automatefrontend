"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Check,
  Copy,
  Menu,
  X,
  RefreshCw,
  Shield,
  Loader2,
  CheckCircle2,
  Sparkles,
  Cpu,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Paperclip,
  FileIcon,
} from "lucide-react";
import { api, Conversation, Message, StepEvent, User } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// CUSTOM FORMATTED OUTPUT (Markdown parser for clean text, numbers, and code)
// ─────────────────────────────────────────────────────────────────────────────
function FormattedOutput({ text }: { text: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none text-[#e2e8f0] prose-td:border prose-td:border-[#1b2336] prose-th:border prose-th:border-[#1b2336] prose-th:bg-[#0c101a] prose-a:text-[#60a5fa] hover:prose-a:text-[#93c5fd]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props: any) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !text.includes(`\n${children}\n`);
            
            if (isInline) {
              return (
                <code
                  className="font-mono text-[11px] bg-[#121724] border border-[#212b40] text-[#c7d5e8] px-1.5 py-0.5 rounded mx-0.5"
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return (
              <CodeSnippetBlock
                lang={match ? match[1] : ""}
                code={String(children).replace(/\n$/, "")}
              />
            );
          },
          strong(props: any) {
            const content = String(props.children);
            const isNumber = /^-?\d+(\.\d+)?%?$/.test(content.trim());
            if (isNumber) {
              return (
                <span className="inline-flex items-center font-mono font-semibold text-white bg-[#141d2d] border border-[#24334c] px-1.5 py-0.5 rounded text-xs shadow-xs mx-0.5">
                  {content}
                </span>
              );
            }
            return <strong className="font-semibold text-white" {...props} />;
          },
          table(props: any) {
            return (
              <div className="overflow-x-auto w-full max-w-full mb-4">
                <table className="w-full text-left border-collapse" {...props} />
              </div>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function CodeSnippetBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-lg border border-[#1b2438] bg-[#07090f] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b0e17] border-b border-[#161c2c] text-[11px] font-mono text-[#677790]">
        <span>{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[#677790] hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3 text-[11px] font-mono text-[#c7d5e8] overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHAT PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ExpandableMessage({ content, isUser, msgId }: { content: string, isUser: boolean, msgId: string }) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      // Check if content height exceeds the max-height (e.g., 250px)
      if (contentRef.current.scrollHeight > 250) {
        setIsOverflowing(true);
      }
    }
  }, [content]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={`transition-all duration-300 ease-in-out ${
          !expanded && isOverflowing ? "max-h-[250px] overflow-hidden" : ""
        }`}
      >
        {isUser ? (
          <div className="p-3 rounded-lg bg-[#0e1320] border border-[#1c263c] text-white text-xs leading-relaxed font-mono whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          <div className="p-3.5 rounded-lg bg-[#0b0e17] border border-[#1c2336] text-[#e2e8f0] shadow-sm">
            <FormattedOutput text={content} />
          </div>
        )}
      </div>

      {!expanded && isOverflowing && (
        <div 
          className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t pointer-events-none rounded-b-lg ${
            isUser ? "from-[#0e1320] to-transparent" : "from-[#0b0e17] to-transparent"
          }`} 
        />
      )}

      {isOverflowing && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[11px] font-mono font-medium text-[#7888a2] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Conversations & Messages State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");

  // Composer & Execution State
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("groq");
  const [reasoningLevel, setReasoningLevel] = useState("standard");
  const [backendOnline, setBackendOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Copied message state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load User & Check Auth
  useEffect(() => {
    const user = api.getUser();
    const token = api.getToken();

    if (user) {
      setCurrentUser(user);
    }

    loadConversations();
    checkBackendHealth();

    // Close sidebar on mobile by default
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [router]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const checkBackendHealth = async () => {
    try {
      await api.checkHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await api.listConversations();
      if (data.conversations && data.conversations.length > 0) {
        setConversations(data.conversations);
        if (!activeConvId) {
          selectConversation(data.conversations[0].id);
        }
      } else {
        handleNewChat();
      }
    } catch {
      // Clean starter conversation with direct output + thinking trace
      const localConvs: Conversation[] = [
        {
          id: "conv-local-1",
          user_id: "demo-usr-01",
          title: "Sample Variance Analysis",
          model_provider: "groq",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 2,
        },
      ];
      setConversations(localConvs);
      setActiveConvId("conv-local-1");
      setMessages([
        {
          id: "msg-local-1",
          conversation_id: "conv-local-1",
          role: "user",
          content:
            "Calculate sample variance for [12.4, 18.2, 24.1, 31.8] using the Python sandbox.",
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
        {
          id: "msg-local-2",
          conversation_id: "conv-local-1",
          role: "assistant",
          content:
            "The sample variance is **62.5892** (sample mean: **21.6250**).",
          model_provider: "groq",
          duration_ms: 184,
          created_at: new Date().toISOString(),
          events: [
            {
              step_number: 1,
              step_type: "thought",
              content:
                "User requests mathematical variance for dataset [12.4, 18.2, 24.1, 31.8]. Formatting Python script for execution in isolated Rust sandbox jail.",
            },
            {
              step_number: 2,
              step_type: "tool_call",
              content: "Dispatched run_sandboxed_code",
              metadata: {
                tool: "run_sandboxed_code",
                args: {
                  language: "python",
                  code: "import numpy as np\ndata = [12.4, 18.2, 24.1, 31.8]\nprint(f'variance={np.var(data):.4f}')",
                },
              },
            },
            {
              step_number: 3,
              step_type: "tool_result",
              content: "Sandbox execution completed with exit code 0",
              metadata: {
                duration_ms: 28,
                memory_mb: 8.5,
                stdout: "variance=62.5892",
              },
            },
            {
              step_number: 4,
              step_type: "thought",
              content:
                "Calculation verified via stdout. Delivering exact computed values.",
            },
          ],
        },
      ]);
    }
  };

  const selectConversation = async (convId: string) => {
    setActiveConvId(convId);
    try {
      const data = await api.getConversation(convId);
      setMessages(data.messages || []);
      setSelectedProvider(data.conversation.model_provider || "groq");
    } catch {
      // Keep existing in local mode
    }
  };

  const handleNewChat = async () => {
    try {
      const newConv = await api.createConversation(
        "New Conversation",
        selectedProvider,
      );
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
    } catch {
      const localConv: Conversation = {
        id: `conv-${Date.now()}`,
        user_id: currentUser?.id || "demo",
        title: "New Conversation",
        model_provider: selectedProvider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0,
      };
      setConversations((prev) => [localConv, ...prev]);
      setActiveConvId(localConv.id);
      setMessages([]);
    }
  };

  const handleDeleteConversation = async (
    convId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(convId);
    } catch {
      // ignore
    }
    const filtered = conversations.filter((c) => c.id !== convId);
    setConversations(filtered);
    if (activeConvId === convId) {
      if (filtered.length > 0) {
        selectConversation(filtered[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleSaveTitle = async (convId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    
    // Optimistic update
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: newTitle.trim() } : c));
    setEditingConvId(null);
    
    try {
      await api.updateConversation(convId, newTitle.trim());
    } catch {
      // Revert on fail if needed
    }
  };

  const handleLogout = () => {
    api.logout();
    router.push("/login");
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = inputPrompt.trim();
    if ((!prompt && !selectedFile) || isLoading || !activeConvId) return;

    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const currentFile = selectedFile;
    const currentPreview = filePreview;
    
    // Clear preview immediately
    setSelectedFile(null);
    setFilePreview(null);

    const userMsgId = `usr-${Date.now()}`;
    let contentStr = prompt;
    if (currentPreview) {
      contentStr = `![Uploaded Image](${currentPreview})\n\n${prompt}`;
    }

    const userMessage: Message = {
      id: userMsgId,
      conversation_id: activeConvId,
      role: "user",
      content: contentStr,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = api.getToken();
      if (!token) {
        throw new Error("No token, simulating offline response");
      }

      // Directly query the live Render Core backend
      const res = await api.sendMessage(
        activeConvId,
        prompt, // API only needs the raw prompt, backend prepends the real base64 file data
        selectedProvider,
        reasoningLevel,
        currentFile || undefined
      );

      if (res?.assistant_message) {
        setMessages((prev) => [...prev, res.assistant_message]);
      }

      if (res?.title) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? { 
                  ...c, 
                  title: res.title, 
                  model_provider: res.model_provider || selectedProvider,
                  updated_at: new Date().toISOString() 
                }
              : c,
          ),
        );
      }
    } catch (err: any) {
      // Offline/Mock mode if API fails or not logged in
      const dummyResponse: Message = {
        id: `asst-mock-${Date.now()}`,
        conversation_id: activeConvId,
        role: "assistant",
        content: `**Offline Mode:** I received your message: "${prompt}". Please log in to use the live backend.`,
        model_provider: selectedProvider,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, dummyResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size limit (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select a file under 5MB.");
      return;
    }

    setSelectedFile(file);

    // Create preview if it's an image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Check system telemetry, goroutines, and heap allocations",
    "Calculate sample variance for [12.4, 18.2, 24.1, 31.8] in Python jail",
    "Query pgvector memory for recent diagnostic checkpoints",
    "Fetch and inspect HTTP headers from https://api.github.com",
  ];

  return (
    <div className="flex h-[100dvh] w-screen bg-[#08090d] text-[#e2e8f0] overflow-hidden font-sans selection:bg-white/20 selection:text-white" style={{ height: '100dvh' }}>
      {/* ── LEFT SIDEBAR ── */}
      {/* Mobile Backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative md:translate-x-0 w-64 ${
          !sidebarOpen ? "md:w-0 md:border-r-0" : "md:w-64"
        } transition-all duration-300 ease-in-out shrink-0 h-full bg-[#090b12] border-r border-[#161a26] flex flex-col justify-between z-50 overflow-hidden`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Brand Bar */}
          <div className="h-14 border-b border-[#161a26] px-4 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 rounded bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-white">Opada</span>
                <span className="text-[10px] font-mono px-1 rounded border border-[#232a3d] bg-[#0e121d] text-[#7888a2]">
                  operator
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded text-[#64748d] hover:text-white hover:bg-[#121622] transition-colors"
              title="Collapse sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Action */}
          <div className="p-3 shrink-0">
            <button
              onClick={handleNewChat}
              className="w-full h-8 px-3 rounded-lg border border-[#1b2336] bg-[#0c101a] text-xs font-mono text-[#c0ccdf] hover:border-white/20 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-[#7888a2]" />
                <span>New Session</span>
              </span>
              <span className="text-[10px] text-[#54647c] font-mono">⌘N</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5 py-1">
            <div className="text-[10px] font-mono text-[#54647c] uppercase px-2 mb-1 font-semibold tracking-wider">
              Sessions ({conversations.length})
            </div>

            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  if (editingConvId !== conv.id) selectConversation(conv.id);
                }}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeConvId === conv.id
                    ? "bg-[#111726] border border-[#212c42] text-white"
                    : "text-[#7888a2] hover:text-[#c0ccdf] hover:bg-[#0d121e] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeConvId === conv.id ? "bg-emerald-400" : "bg-[#273248]"}`}
                  />
                  {editingConvId === conv.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      onBlur={() => handleSaveTitle(conv.id, editTitleText)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle(conv.id, editTitleText);
                        if (e.key === "Escape") setEditingConvId(null);
                      }}
                      className="bg-[#0b0e17] border border-[#1b2336] text-white rounded px-1.5 py-0.5 outline-none font-mono text-xs w-full mr-2"
                    />
                  ) : (
                    <span className="truncate font-mono text-xs" onDoubleClick={() => {
                      setEditingConvId(conv.id);
                      setEditTitleText(conv.title);
                    }}>
                      {conv.title}
                    </span>
                  )}
                </div>

                {editingConvId !== conv.id && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingConvId(conv.id);
                        setEditTitleText(conv.title);
                      }}
                      className="p-1 hover:text-[#c0ccdf] text-[#54647c] rounded"
                      title="Rename session"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="p-1 hover:text-red-400 text-[#54647c] rounded"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Status / Bottom Info */}
          <div className="p-3 border-t border-[#161a26] bg-[#07090f] shrink-0">
            <div className="flex items-center justify-between mb-2.5 px-1 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-[#7888a2]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-emerald-400" : "bg-amber-400"}`}
                />
                <span>{backendOnline ? "Core Online" : "Demo Mode"}</span>
              </span>
              <span className="text-[#54647c] text-[10px]">~14.2 MB RSS</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c101a] border border-[#182030]">
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded bg-[#141b2c] border border-[#232e48] flex items-center justify-center text-white text-[11px] font-mono font-bold">
                  {currentUser?.name?.charAt(0) || "O"}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-white truncate">
                    {currentUser?.name || "Operator"}
                  </div>
                  <div className="text-[10px] text-[#54647c] font-mono truncate">
                    {currentUser?.email || "offline"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-[#64748d] hover:text-white rounded hover:bg-[#141b2b] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#08090d] relative">
        {/* Top Header */}
        <header className="h-14 min-h-[3.5rem] border-b border-[#161a26] bg-[#08090d] px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-md hover:bg-[#121622] text-[#7888a2] hover:text-white transition-colors shrink-0"
                title="Open sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-2">
              <span className="text-xs font-mono font-semibold text-white truncate w-full sm:max-w-xs">
                {conversations.find((c) => c.id === activeConvId)?.title ||
                  "Active Workspace"}
              </span>
              <span className="text-[#3b455b] hidden sm:inline shrink-0">•</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#1b2336] bg-[#0c101a] text-[#8e9bb0] hidden sm:inline-block shrink-0">
                PostgreSQL SKIP LOCKED
              </span>
            </div>
          </div>

          {/* Model Switcher & Overview Link */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-[#0c101a] border border-[#1b2336] rounded-md px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono">
              <span className="text-[#54647c] text-[11px] hidden sm:inline">Model:</span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-transparent text-[#c0ccdf] font-medium focus:outline-none cursor-pointer text-[10px] sm:text-xs w-[60px] sm:w-auto text-ellipsis"
              >
                <option value="groq" className="bg-[#0c101a] text-white">
                  Groq LPU (~180ms)
                </option>
                <option value="cohere" className="bg-[#0c101a] text-white">
                  Cohere (132k Context)
                </option>
                <option value="mistral" className="bg-[#0c101a] text-white">
                  Mistral Large
                </option>
                <option value="gemini" className="bg-[#0c101a] text-white">
                  Google Gemini 2.0
                </option>
              </select>
            </div>

            <Link
              href="/"
              className="hidden min-[400px]:block text-xs font-mono text-[#7888a2] hover:text-white px-2.5 py-1 rounded border border-[#1b2336] hover:bg-[#0e1320] transition-colors"
            >
              Overview
            </Link>
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center px-4 py-8">
              <div className="w-10 h-10 rounded-lg bg-[#0e121d] border border-[#1c2438] flex items-center justify-center text-[#a5b4cb] mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5">
                Autonomous Operator Console
              </h2>
              <p className="text-xs text-[#7888a2] max-w-md leading-relaxed mb-6 font-mono">
                Direct execution of tool-calling ReAct loops with isolated Rust
                sandbox jails and pgvector memory.
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left font-mono text-xs">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputPrompt(q);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-lg bg-[#0b0e17] hover:bg-[#0f1422] border border-[#182030] hover:border-[#25324b] text-[#8e9bb0] hover:text-white transition-all text-left flex items-start gap-2 cursor-pointer group"
                  >
                    <span className="text-[#54647c] group-hover:text-white">
                      &gt;
                    </span>
                    <span className="leading-relaxed text-[11px]">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-3xl ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center text-xs font-mono font-bold ${
                    msg.role === "user"
                      ? "bg-white text-[#08090d]"
                      : "bg-[#0f1422] border border-[#1c263c] text-[#a5b4cb]"
                  }`}
                >
                  {msg.role === "user" ? (
                    "U"
                  ) : (
                    <Terminal className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Message Body */}
                <div className="flex flex-col space-y-1.5 flex-1 min-w-0 overflow-hidden">
                  {/* MESSAGE BODY (Auto-collapsing if long) */}
                  <ExpandableMessage
                    content={msg.content}
                    isUser={msg.role === "user"}
                    msgId={msg.id}
                  />

                  {/* Message Meta */}
                  <div
                    className={`flex items-center gap-4 text-[10px] font-mono text-[#54647c] ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.model_provider && <span>• {msg.model_provider}</span>}
                    </div>

                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          onClick={() => copyText(msg.content, msg.id)}
                          className="flex items-center gap-1.5 text-[#64748d] hover:text-[#c0ccdf] hover:bg-[#1c263c] px-1.5 py-1 rounded transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="font-semibold hidden sm:inline-block">Copy</span>
                        </button>
                        
                        <button className="text-[#64748d] hover:text-[#c0ccdf] hover:bg-[#1c263c] p-1 rounded transition-colors cursor-pointer" title="Good response">
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        
                        <button className="text-[#64748d] hover:text-[#c0ccdf] hover:bg-[#1c263c] p-1 rounded transition-colors cursor-pointer" title="Bad response">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        <button className="text-[#64748d] hover:text-[#c0ccdf] hover:bg-[#1c263c] p-1 rounded transition-colors cursor-pointer ml-1" title="Regenerate">
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-7 h-7 rounded-md bg-[#0f1422] border border-[#1c263c] text-white flex items-center justify-center shrink-0">
                <Terminal className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-lg bg-[#0a0d15] border border-[#171d2b] text-xs font-mono text-[#8e9bb0] flex items-center gap-2.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Thinking &amp; executing tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── PROMPT COMPOSER ── */}
        <div className="p-2 sm:p-4 border-t border-[#161a26] bg-[#08090d] shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex flex-col gap-2"
          >
            {/* File Preview Area */}
            {filePreview && (
              <div className="flex items-center gap-2 mb-1">
                <div className="relative w-16 h-16 rounded overflow-hidden border border-[#1b2336] bg-[#0c101a]">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-0.5 right-0.5 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            {selectedFile && !filePreview && (
              <div className="flex items-center gap-2 mb-1">
                <div className="relative px-3 py-1.5 rounded border border-[#1b2336] bg-[#0c101a] text-[#c0ccdf] text-[11px] font-mono flex items-center gap-2">
                  <FileIcon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="relative flex items-end bg-[#0a0d15] border border-[#1b2336] rounded-lg p-1.5 sm:p-2 focus-within:border-white/30 transition-colors gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.txt,.csv"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-[#54647c] hover:text-[#c0ccdf] rounded shrink-0 cursor-pointer"
                title="Attach file (Image, PDF, etc)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputPrompt}
                onChange={(e) => {
                  setInputPrompt(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message Opada..."
                className="flex-1 min-w-0 max-h-36 bg-transparent text-[13px] sm:text-xs text-[#e2e8f0] placeholder-[#54647c] focus:outline-none resize-none px-1 sm:px-2 py-1 font-mono"
              />

              <div className="hidden sm:flex items-center gap-1.5 mr-1 bg-[#0c101a] border border-[#1b2336] rounded-md px-1.5 py-1 text-[10px] font-mono">
                <select
                  value={reasoningLevel}
                  onChange={(e) => setReasoningLevel(e.target.value)}
                  className="bg-transparent text-[#7888a2] font-medium focus:outline-none cursor-pointer text-[10px]"
                >
                  <option value="quick" className="bg-[#0c101a] text-white">Quick</option>
                  <option value="standard" className="bg-[#0c101a] text-white">Standard</option>
                  <option value="deep" className="bg-[#0c101a] text-white">Deep Research</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={(!inputPrompt.trim() && !selectedFile) || isLoading}
                className="p-2 rounded bg-white text-[#08090d] hover:bg-[#e2e8f0] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>


          </form>
        </div>
      </main>
    </div>
  );
}
