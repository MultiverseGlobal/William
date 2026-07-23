import { supabaseMobile } from './supabaseClient';

export interface AtlasGoal {
  id: string;
  title: string;
  vision: string;
  milestones: string[];
  alignmentScore: number;
}

export async function fetchAtlasStrategy(): Promise<AtlasGoal[]> {
  try {
    const { data, error } = await supabaseMobile
      .from('commands')
      .select('*')
      .order('priority', { ascending: true });

    if (!error && data) {
      return data.map(d => ({
        id: d.id,
        title: d.title,
        vision: 'High-leverage strategic focus area.',
        milestones: ['Database Persistence', 'Claude 3.5 Sonnet Reasoning'],
        alignmentScore: 90,
      }));
    }
  } catch (err) {
    console.log('Atlas Adapter fetch error:', err);
  }
  return [];
}
