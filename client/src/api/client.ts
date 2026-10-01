const API_BASE_URL = '/api';

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

  // Remove Content-Type for FormData uploads
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || result.message || 'API request failed');
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
