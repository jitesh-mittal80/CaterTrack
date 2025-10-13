export function getApiUrl(path: string): string {
    const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
    const p = path.replace(/^\/+/, '');
    return `${base}/${p}`;
  }
  
  export async function apiFetch<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data: T; response: Response }> {
    const token = localStorage.getItem('auth_token');
  
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  
    const response = await fetch(getApiUrl(path), {
      ...options,
      headers,
    });
  
    let data: any = null;
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (isJson) {
      data = await response.json().catch(() => null);
    }
  
    return { data, response };
  }