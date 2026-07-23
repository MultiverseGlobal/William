// Atlas Strategy Adapter — Fetches high-level vision, goals, and strategic alignment from Atlas
export interface AtlasGoal {
  id: string;
  title: string;
  vision: string;
  milestones: string[];
  alignmentScore: number; // 0-100%
}

export async function fetchAtlasStrategy(): Promise<AtlasGoal[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/data?table=journeys`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(d => ({
          id: d.id,
          title: d.title,
          vision: d.vision,
          milestones: d.milestones || [],
          alignmentScore: d.progress || 85,
        }));
      }
    }
  } catch (err) {
    console.log('Atlas Adapter: Error fetching strategy, using fallback:', err);
  }
  return [
    {
      id: 'a1',
      title: 'High-Agency Chief of Staff Platform',
      vision: 'Seamless personal execution companion operating in real-time.',
      milestones: ['Daily Command Engine', 'Recovery Engine', 'Metaphor Context Adapter'],
      alignmentScore: 92,
    },
  ];
}
