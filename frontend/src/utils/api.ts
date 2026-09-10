const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getApiUrl(path: string): string {
  if (import.meta.env.PROD && !API_BASE) {
    throw new Error('The image service is not configured. Set VITE_API_URL in GitHub Actions.');
  }

  return `${API_BASE}${path}`;
}

export async function applyFilter(
  file: File,
  filterId: string,
  intensity: number
): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('filter_name', filterId);
  formData.append('intensity', intensity.toString());

  const response = await fetch(getApiUrl('/apply-filter'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '' }));
    throw new Error(error.detail || `Filter service returned ${response.status}.`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function fetchFilters(): Promise<Record<string, string>> {
  const response = await fetch(getApiUrl('/filters'));
  if (!response.ok) throw new Error('Failed to fetch filters');
  return response.json();
}