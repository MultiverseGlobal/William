import { IContextProvider, ContextItem } from './IContextProvider';

export class MockContextProvider implements IContextProvider {
  async getContext(query: string): Promise<ContextItem[]> {
    const q = query.toLowerCase();
    const allItems: ContextItem[] = [
      {
        id: 'ctx_1',
        title: 'Pseudonyms Platform Architecture',
        category: 'document',
        summary: 'Strategic decoupling of William (Execution), Metaphor (Knowledge), and Atlas (Strategy).',
        timestamp: '10 mins ago',
      },
      {
        id: 'ctx_2',
        title: 'Leadership Sync Notes',
        category: 'meeting',
        summary: 'Agreed to clear afternoon calendar blocks to focus on core platform execution.',
        timestamp: '1 hour ago',
      },
      {
        id: 'ctx_3',
        title: 'Q3 Executive Growth Alignment',
        category: 'insight',
        summary: 'Targeting 20% efficiency increase through AI Chief of Staff automated scheduling.',
        timestamp: 'Yesterday',
      },
    ];

    if (!query.trim()) return allItems;
    return allItems.filter(item =>
      item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q)
    );
  }

  async getImportantPeople(): Promise<Array<{ id: string; name: string; role: string; lastContact: string }>> {
    return [
      { id: 'p1', name: 'Sarah Jenkins', role: 'Head of Product', lastContact: '2 hours ago' },
      { id: 'p2', name: 'David Miller', role: 'VP of Engineering', lastContact: 'Yesterday' },
      { id: 'p3', name: 'Elena Rostova', role: 'Lead Design Architect', lastContact: '3 days ago' },
    ];
  }

  async getRecentInsights(): Promise<string[]> {
    return [
      'Focus blocks are 35% longer on Thursdays.',
      'Morning scheduling reduces meeting overrun by 40%.',
    ];
  }
}

export const contextProvider: IContextProvider = new MockContextProvider();
