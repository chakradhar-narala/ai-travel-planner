const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

const request = async (endpoint: string, options: FetchOptions = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const { body, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

export const api = {
  get: (endpoint: string, options?: Omit<FetchOptions, 'body'>) =>
    request(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, body: unknown, options?: Omit<FetchOptions, 'body'>) =>
    request(endpoint, { ...options, method: 'POST', body }),
    
  put: (endpoint: string, body: unknown, options?: Omit<FetchOptions, 'body'>) =>
    request(endpoint, { ...options, method: 'PUT', body }),
    
  delete: (endpoint: string, options?: Omit<FetchOptions, 'body'>) =>
    request(endpoint, { ...options, method: 'DELETE' }),
};
