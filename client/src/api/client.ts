const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const token = localStorage.getItem('kd_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-admin-dev-access': 'true', // Direct access mode in development
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData uploads (browser auto-sets boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return {
        success: false,
        error: {
          message: `Server returned non-JSON response (${response.status} ${response.statusText}): ${text.slice(0, 120)}`
        }
      };
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: { message: result.error?.message || result.message || `API request failed with status ${response.status}` }
      };
    }

    return result;
  } catch (err: any) {
    console.error(`API Error [${endpoint}]:`, err.message || err);
    return {
      success: false,
      error: { message: err.message || 'Network request failed' }
    };
  }
}
