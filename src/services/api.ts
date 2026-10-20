// API Service for PampoBoard Cloud Backend

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('pampo_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erro na requisição: ${response.statusText}`);
  }

  return data as T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  defaultWorkspaceId?: string;
}

export const api = {
  auth: {
    async register(name: string, email: string, password: string): Promise<AuthResponse> {
      const res = await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem('pampo_auth_token', res.token);
      localStorage.setItem('pampo_auth_user', JSON.stringify(res.user));
      return res;
    },

    async login(email: string, password: string): Promise<AuthResponse> {
      const res = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('pampo_auth_token', res.token);
      localStorage.setItem('pampo_auth_user', JSON.stringify(res.user));
      return res;
    },

    async getMe(): Promise<{ user: AuthUser }> {
      return request<{ user: AuthUser }>('/auth/me');
    },

    async updateProfile(data: { name?: string; avatar?: string }): Promise<{ user: AuthUser }> {
      const res = await request<{ user: AuthUser }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      localStorage.setItem('pampo_auth_user', JSON.stringify(res.user));
      return res;
    },

    async loginWithGithub(data: { githubUsername?: string; code?: string }): Promise<AuthResponse> {
      const res = await request<AuthResponse>('/auth/github', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem('pampo_auth_token', res.token);
      localStorage.setItem('pampo_auth_user', JSON.stringify(res.user));
      return res;
    },

    async loginWithGoogle(data: { email: string; name?: string; picture?: string }): Promise<AuthResponse> {
      const res = await request<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem('pampo_auth_token', res.token);
      localStorage.setItem('pampo_auth_user', JSON.stringify(res.user));
      return res;
    },

    logout() {
      localStorage.removeItem('pampo_auth_token');
      localStorage.removeItem('pampo_auth_user');
    },

    getCurrentUser(): AuthUser | null {
      try {
        const saved = localStorage.getItem('pampo_auth_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    },

    hasToken(): boolean {
      return !!localStorage.getItem('pampo_auth_token');
    },
  },

  workspaces: {
    async list() {
      return request<any[]>('/workspaces');
    },

    async create(title: string, description?: string, color?: string, icon?: string) {
      return request<any>('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ title, description, color, icon }),
      });
    },

    async update(id: string, updates: any) {
      return request<any>(`/workspaces/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    async delete(id: string) {
      return request<any>(`/workspaces/${id}`, {
        method: 'DELETE',
      });
    },
  },

  boards: {
    async get(workspaceId: string) {
      return request<{ cards: any[]; connections: any[]; zones: any[] }>(`/boards/${workspaceId}`);
    },

    async sync(workspaceId: string, data: { cards: any[]; connections: any[]; zones: any[] }) {
      return request<{ success: boolean; timestamp: number }>(`/boards/${workspaceId}/sync`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  upload: {
    async base64(dataUrl: string): Promise<{ url: string; filename: string }> {
      return request<{ url: string; filename: string }>('/upload/base64', {
        method: 'POST',
        body: JSON.stringify({ dataUrl }),
      });
    },

    async file(file: File): Promise<{ url: string; filename: string }> {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('pampo_auth_token');
      const response = await fetch(`${API_BASE}/upload/file`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha no upload da imagem');
      }
      return data;
    },
  },

  share: {
    async get(shareId: string) {
      return request<{
        workspace: any;
        cards: any[];
        connections: any[];
        zones: any[];
      }>(`/share/${shareId}`);
    },
  },
};
