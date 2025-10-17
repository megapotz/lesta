const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

const buildUrl = (path: string, query?: Record<string, string | number | boolean | undefined>) => {
  const url = new URL(path, API_BASE_URL.startsWith('http') ? API_BASE_URL : window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  if (!API_BASE_URL.startsWith('http')) {
    const relative = API_BASE_URL.replace(/\/$/, '') + url.pathname;
    url.pathname = relative;
  }

  return url.pathname + url.search;
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson && data?.message ? data.message : response.statusText;
    throw new Error(message || 'Request failed');
  }

  return data;
};

export const apiClient = {
  get: async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const url = buildUrl(path, options.query);
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
      ...options,
    });

    return handleResponse(response);
  },

  post: async <T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> => {
    const url = buildUrl(path, options.query);
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });

    return handleResponse(response);
  },

  patch: async <T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> => {
    const url = buildUrl(path, options.query);
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });

    return handleResponse(response);
  },

  delete: async (path: string, options: RequestOptions = {}): Promise<void> => {
    const url = buildUrl(path, options.query);
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
      ...options,
    });

    await handleResponse(response);
  },

  postFormData: async <T>(path: string, formData: FormData, options: RequestOptions = {}): Promise<T> => {
    const url = buildUrl(path, options.query);
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      ...options,
    });

    return handleResponse(response);
  },
};
