import { williamStore, CardItem } from '../store/useWilliamStore';

export function setupNotificationListeners() {
  // Listen for simulated push notification events or native push handlers
  console.log('[NotificationService] Listeners registered for push deep-linking & urgent interrupts');
}

export function simulatePushNotificationTap(item?: CardItem) {
  const targetItem: CardItem = item || {
    id: 'push-item-' + Date.now(),
    title: 'Incoming Executive Briefing',
    subtitle: 'Deep-linked from Notification',
    body: 'Crucial update regarding Pseudonyms monorepo deployment. Tap Got It to acknowledge.',
    type: 'brief',
    actionLabel: 'Got it',
    urgent: true,
  };

  williamStore.handlePushNotification(targetItem);
}

export function simulateUrgentInterrupt(item?: CardItem) {
  const urgentItem: CardItem = item || {
    id: 'urgent-item-' + Date.now(),
    title: 'Unprompted Interrupt: Critical Update',
    subtitle: 'William Chief of Staff Interruption',
    body: 'Calendar conflict detected for 2:00 PM meeting. Immediate rescheduling option available.',
    type: 'meeting',
    actionLabel: 'Resolve Now',
    urgent: true,
  };

  williamStore.triggerUrgentInterrupt(urgentItem);
}
