import { useState, useEffect } from 'react';

export interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  type: 'meeting' | 'brief' | 'mission' | 'settings' | 'timeline';
  actionLabel?: string;
  urgent?: boolean;
}

export const SAMPLE_HEADLINES = [
  "You're 20 minutes ahead of schedule today.",
  "Meeting with Sarah at 2:00 PM — agenda prep ready.",
  "3 high-priority briefings pending your review.",
  "Market intelligence update: Pseudonyms quarterly trend report.",
  "Resting focus period active until 11:30 AM.",
];

export const SAMPLE_ITEMS: CardItem[] = [
  {
    id: 'item-1',
    title: 'Urgent Schedule Conflict',
    subtitle: '11:30 AM • Team Sync',
    body: 'Overlaps with executive review. Recommended action: Reschedule Team Sync to 3:30 PM.',
    type: 'meeting',
    actionLabel: 'Accept Reschedule',
    urgent: true,
  },
  {
    id: 'item-2',
    title: 'Executive Briefing',
    subtitle: 'Daily Digest',
    body: 'All key deliverables on track. 2 pull requests merged, 0 blocking incidents reported today.',
    type: 'brief',
    actionLabel: 'Acknowledge',
    urgent: false,
  },
  {
    id: 'item-3',
    title: 'Chief of Staff Settings',
    subtitle: 'Preferences & Connections',
    body: 'Calendar connected. Push notifications active. Command Amber theme loaded.',
    type: 'settings',
    actionLabel: 'Done',
    urgent: false,
  },
];

class WilliamStore {
  private listeners: Set<() => void> = new Set();

  state = {
    isZoomed: false,
    activeItem: null as CardItem | null,
    pendingCount: 3,
    headlineIndex: 0,
    onboardingStep: 0, // 0 = done/ready, 1 = welcome, 2 = calendar, 3 = first mission
    items: SAMPLE_ITEMS,
  };

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  get headline() {
    return SAMPLE_HEADLINES[this.state.headlineIndex % SAMPLE_HEADLINES.length];
  }

  rotateHeadline() {
    this.state.headlineIndex = (this.state.headlineIndex + 1) % SAMPLE_HEADLINES.length;
    this.notify();
  }

  triggerZoom(item?: CardItem) {
    const targetItem = item || this.state.items[0] || null;
    this.state.activeItem = targetItem;
    this.state.isZoomed = true;
    this.notify();
  }

  dismissZoom() {
    this.state.isZoomed = false;
    if (this.state.pendingCount > 0) {
      this.state.pendingCount = Math.max(0, this.state.pendingCount - 1);
    }
    this.notify();
    // Rotate headline after dismissal
    setTimeout(() => {
      this.rotateHeadline();
    }, 400);
  }

  // Unprompted Urgent Interrupt (zooms in on its own)
  triggerUrgentInterrupt(urgentItem: CardItem) {
    this.state.activeItem = urgentItem;
    this.state.isZoomed = true;
    this.notify();
  }

  // Push Notification Deep-Link (lands directly into zoomed card)
  handlePushNotification(item: CardItem) {
    this.state.activeItem = item;
    this.state.isZoomed = true;
    this.notify();
  }
}

export const williamStore = new WilliamStore();

export function useWilliamStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = williamStore.subscribe(() => setTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);


  return {
    ...williamStore.state,
    headline: williamStore.headline,
    triggerZoom: (item?: CardItem) => williamStore.triggerZoom(item),
    dismissZoom: () => williamStore.dismissZoom(),
    triggerUrgentInterrupt: (item: CardItem) => williamStore.triggerUrgentInterrupt(item),
    handlePushNotification: (item: CardItem) => williamStore.handlePushNotification(item),
    rotateHeadline: () => williamStore.rotateHeadline(),
  };
}
