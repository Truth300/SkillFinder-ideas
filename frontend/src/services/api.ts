const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}, token?: string | null) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    try {
      const data = await response.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      // Failed to parse JSON error response
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

export const api = {
  analyzeSkills: (skills: string, token?: string | null) => 
    fetchWithAuth('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ skills }),
    }, token),

  saveProblem: (problem: Record<string, unknown>, token?: string | null) =>
    fetchWithAuth('/api/problems/save', {
      method: 'POST',
      body: JSON.stringify(problem),
    }, token),

  getSavedProblems: (token?: string | null) =>
    fetchWithAuth('/api/problems', {
      method: 'GET',
    }, token),
    
  // Placeholders for auth
  signIn: (data: Record<string, unknown>) => 
    fetchWithAuth('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  signUp: (data: Record<string, unknown>) => 
    fetchWithAuth('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
