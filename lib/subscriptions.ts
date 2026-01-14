// lib/subscriptions.ts
// Tạm thời lưu trong memory, sau này có thể migrate sang database

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

let subscriptions: PushSubscription[] = [];

export function addSubscription(subscription: PushSubscription): void {
  const existingIndex = subscriptions.findIndex(
    (sub) => sub.endpoint === subscription.endpoint
  );

  if (existingIndex >= 0) {
    subscriptions[existingIndex] = subscription;
    console.log(`📝 Updated existing subscription: ${subscription.endpoint}`);
  } else {
    subscriptions.push(subscription);
    console.log(`✅ Added new subscription. Total: ${subscriptions.length}`);
  }
}

export function getAllSubscriptions(): PushSubscription[] {
  return subscriptions;
}

export function removeSubscription(endpoint: string): void {
  const index = subscriptions.findIndex((sub) => sub.endpoint === endpoint);
  if (index >= 0) {
    subscriptions.splice(index, 1);
    console.log(`🗑️ Removed subscription: ${endpoint}`);
  }
}

export function getSubscriptionCount(): number {
  return subscriptions.length;
}

