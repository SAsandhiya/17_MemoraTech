const API_URL = 'https://hamcs.onrender.com/api';

export const api = {
  // Decisions
  async getDecisions() {
    const res = await fetch(`${API_URL}/decisions`);
    return res.json();
  },

  async createDecision(decision, category = 'general') {
    const res = await fetch(`${API_URL}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, category })
    });
    if (!res.ok) {
      const errorData = await res.json();
      const error = new Error(errorData.error || 'Failed to create decision');
      error.code = errorData.code;
      error.retryAfter = errorData.retryAfter;
      throw error;
    }
    return res.json();
  },

  async deleteDecision(id) {
    const res = await fetch(`${API_URL}/decisions/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async undoDelete(undoId) {
    const res = await fetch(`${API_URL}/decisions/undo/${undoId}`, { method: 'POST' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to undo');
    }
    return res.json();
  },

  async togglePin(id) {
    const res = await fetch(`${API_URL}/decisions/${id}/pin`, { method: 'PATCH' });
    return res.json();
  },

  async updateCategory(id, category) {
    const res = await fetch(`${API_URL}/decisions/${id}/category`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    return res.json();
  },

  async clearAllDecisions() {
    const res = await fetch(`${API_URL}/decisions`, { method: 'DELETE' });
    return res.json();
  },

  // Chat
  async chat(question) {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!res.ok) {
      const errorData = await res.json();
      const error = new Error(errorData.error || 'Failed to generate response');
      error.code = errorData.code;
      error.retryAfter = errorData.retryAfter;
      throw error;
    }
    return res.json();
  }
};

// Categories configuration
export const CATEGORIES = {
  general: { color: '#737373', label: 'General' },
  career: { color: '#3B82F6', label: 'Career' },
  finance: { color: '#10B981', label: 'Finance' },
  personal: { color: '#EC4899', label: 'Personal' },
  tech: { color: '#8B5CF6', label: 'Tech' },
  health: { color: '#F97316', label: 'Health' }
};

// Decision templates with icon names (rendered as SVGs in components)
export const TEMPLATES = [
  { icon: 'briefcase', label: 'Career', prompt: 'I decided to [career decision] because [reasoning]...' },
  { icon: 'currency', label: 'Finance', prompt: 'I chose to [financial decision] considering [factors]...' },
  { icon: 'code', label: 'Tech', prompt: 'I selected [technology/tool] for [project] because...' },
  { icon: 'heart', label: 'Health', prompt: 'I committed to [health goal] because...' },
  { icon: 'book', label: 'Learning', prompt: 'I will learn [skill/topic] because...' }
];
