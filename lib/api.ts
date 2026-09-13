// Centralized API client for OPADA Operator Backend
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface StepEvent {
  run_id?: string;
  step_number: number;
  step_type: "thought" | "tool_call" | "tool_result" | "final_answer" | "error";
  content: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model_provider?: string;
  events?: StepEvent[];
  duration_ms?: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model_provider: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  model: string;
  speed: string;
  description: string;
  active: boolean;
}

const API_BASE = "https://automatebackend.onrender.com/api/v1";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("opada_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("opada_token", token);
      } else {
        localStorage.removeItem("opada_token");
        localStorage.removeItem("opada_user");
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined" && !this.token) {
      this.token = localStorage.getItem("opada_token");
    }
    return this.token;
  }

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("opada_user");
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  setUser(user: User | null) {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("opada_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("opada_user");
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      this.logout();
    }

    if (!res.ok) {
      let errMsg = `Request failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        errMsg = errorJson.error || errMsg;
      } catch {
        const text = await res.text();
        if (text) errMsg = text;
      }
      throw new Error(errMsg);
    }

    return res.json();
  }

  // Auth
  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      },
    );
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  logout() {
    this.setToken(null);
    this.setUser(null);
  }

  // Health
  async checkHealth(): Promise<{ status: string; database: string }> {
    const res = await fetch("http://localhost:8080/health", { method: "GET" });
    if (!res.ok) throw new Error("Backend offline");
    return res.json();
  }

  // Providers
  async listProviders(): Promise<{
    default_provider: string;
    providers: ProviderInfo[];
  }> {
    return this.request<{
      default_provider: string;
      providers: ProviderInfo[];
    }>("/providers");
  }

  // Conversations
  async listConversations(): Promise<{ conversations: Conversation[] }> {
    return this.request<{ conversations: Conversation[] }>("/conversations");
  }

  async createConversation(
    title?: string,
    modelProvider?: string,
  ): Promise<Conversation> {
    return this.request<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify({ title, model_provider: modelProvider || "groq" }),
    });
  }

  async getConversation(
    id: string,
  ): Promise<{ conversation: Conversation; messages: Message[] }> {
    return this.request<{ conversation: Conversation; messages: Message[] }>(
      `/conversations/${id}`,
    );
  }

  async updateConversation(
    id: string,
    title: string,
  ): Promise<{ id: string; title: string }> {
    return this.request<{ id: string; title: string }>(`/conversations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    });
  }

  async deleteConversation(id: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/conversations/${id}`, {
      method: "DELETE",
    });
  }

  async sendMessage(
    conversationId: string,
    content: string,
    provider?: string,
  ): Promise<{
    conversation_id: string;
    title: string;
    model_provider: string;
    user_message: Message;
    assistant_message: Message;
  }> {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, provider }),
    });
  }
}

export const api = new ApiClient();
