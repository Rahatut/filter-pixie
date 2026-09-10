const API_BASE = import.meta.env.VITE_API_URL || '';

export async function applyFilter(
  file: File,
  filterId: string,
  intensity: number
): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('filter_name', filterId);
  formData.append('intensity', intensity.toString());

  const response = await fetch(`${API_BASE}/apply-filter`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Filter failed' }));
    throw new Error(error.detail || 'Failed to apply filter');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function fetchFilters(): Promise<Record<string, string>> {
  const response = await fetch(`${API_BASE}/filters`);
  if (!response.ok) throw new Error('Failed to fetch filters');
  return response.json();
}