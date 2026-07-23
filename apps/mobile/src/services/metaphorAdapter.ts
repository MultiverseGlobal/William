import { supabaseMobile } from './supabaseClient';

export interface MetaphorDocument {
  id: string;
  title: string;
  summary: string;
  url?: string;
  tags: string[];
}

export async function fetchMetaphorContext(query: string): Promise<MetaphorDocument[]> {
  try {
    const { data, error } = await supabaseMobile
      .from('briefings')
      .select('*');

    if (!error && data) {
      const mapped = data.map(d => ({
        id: d.id,
        title: d.title,
        summary: d.body || d.subtitle,
        tags: [d.type || 'Context'],
      }));
      if (!query.trim()) return mapped;
      return mapped.filter(m => m.title.toLowerCase().includes(query.toLowerCase()) || m.summary.toLowerCase().includes(query.toLowerCase()));
    }
  } catch (err) {
    console.log('Metaphor Adapter fetch error:', err);
  }
  return [];
}
