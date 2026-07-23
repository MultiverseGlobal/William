// Metaphor Context Adapter — Fetches long-term knowledge & document summaries from Metaphor
export interface MetaphorDocument {
  id: string;
  title: string;
  summary: string;
  url?: string;
  tags: string[];
}

export async function fetchMetaphorContext(query: string): Promise<MetaphorDocument[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/data?table=library`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.filter(d => d.title.toLowerCase().includes(query.toLowerCase()) || d.content?.toLowerCase().includes(query.toLowerCase()));
      }
    }
  } catch (err) {
    console.log('Metaphor Adapter: Error fetching context, using fallback:', err);
  }
  return [
    {
      id: 'm1',
      title: 'Pseudonyms Strategic Positioning Q3',
      summary: 'Executive analysis of AI companion market alignment, leverage compounding, and user focus.',
      tags: ['Strategy', 'Executive'],
    },
  ];
}
