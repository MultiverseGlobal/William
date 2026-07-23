import { useState, useEffect } from 'react';

export type AppStage = 'LISTENING' | 'PROCESSING' | 'CONSTELLATION' | 'FILE_STACK' | 'EDIT_MODE';

export interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  type: 'meeting' | 'brief' | 'mission' | 'settings' | 'timeline';
  actionLabel?: string;
  urgent?: boolean;
}

export interface WilliamFileCard {
  id: string;
  name: string;
  size: string;
  timestamp: string;
  format: string;
  iconType: 'document' | 'calendar' | 'chart' | 'cube' | 'layers' | 'shield';
}

export interface ConstellationNode {
  id: string;
  label: string;
  isPrimary?: boolean;
  xPercent: number; // 0-100
  yPercent: number; // 0-100
  fileCount: number;
}

export const WILLIAM_NODES: ConstellationNode[] = [
  { id: 'briefings', label: 'Executive Briefings', isPrimary: true, xPercent: 50, yPercent: 48, fileCount: 0 },
];

export const WILLIAM_FILES: WilliamFileCard[] = [];

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
    stage: 'LISTENING' as AppStage,
    activeNode: WILLIAM_NODES[0] as ConstellationNode,
    isEditMode: false,
    queryText: 'Hey Natural, show me Apple meeting files',
    isZoomed: false,
    activeItem: null as CardItem | null,
    pendingCount: 3,
    headlineIndex: 0,
    onboardingStep: 0,
    items: SAMPLE_ITEMS,
    files: WILLIAM_FILES,
    nodes: WILLIAM_NODES,
  };

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  setStage(stage: AppStage) {
    this.state.stage = stage;
    if (stage !== 'EDIT_MODE') {
      this.state.isEditMode = false;
    }
    this.notify();
  }

  selectNode(node: ConstellationNode) {
    this.state.activeNode = node;
    this.setStage('FILE_STACK');
  }

  toggleEditMode() {
    this.state.isEditMode = !this.state.isEditMode;
    if (this.state.isEditMode) {
      this.state.stage = 'EDIT_MODE';
    } else {
      this.state.stage = 'FILE_STACK';
    }
    this.notify();
  }

  resetToListening() {
    this.state.isEditMode = false;
    this.state.stage = 'LISTENING';
    this.notify();
  }

  get headline() {
    return SAMPLE_HEADLINES[this.state.headlineIndex % SAMPLE_HEADLINES.length];
  }

  deleteLastFile() {
    if (this.state.files.length > 0) {
      this.state.files = this.state.files.slice(0, -1);
      this.notify();
    }
  }

  addFile(file: WilliamFileCard) {
    this.state.files = [file, ...this.state.files];
    this.notify();
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
    setTimeout(() => {
      this.rotateHeadline();
    }, 400);
  }

  triggerUrgentInterrupt(urgentItem: CardItem) {
    this.state.activeItem = urgentItem;
    this.state.isZoomed = true;
    this.notify();
  }

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
    setStage: (stage: AppStage) => williamStore.setStage(stage),
    selectNode: (node: ConstellationNode) => williamStore.selectNode(node),
    toggleEditMode: () => williamStore.toggleEditMode(),
    resetToListening: () => williamStore.resetToListening(),
    triggerZoom: (item?: CardItem) => williamStore.triggerZoom(item),
    dismissZoom: () => williamStore.dismissZoom(),
    triggerUrgentInterrupt: (item: CardItem) => williamStore.triggerUrgentInterrupt(item),
    handlePushNotification: (item: CardItem) => williamStore.handlePushNotification(item),
    rotateHeadline: () => williamStore.rotateHeadline(),
    deleteLastFile: () => williamStore.deleteLastFile(),
    addFile: (file: WilliamFileCard) => williamStore.addFile(file),
  };
}

