import { NextResponse } from 'next/server';
import { getAllSubscriptions } from '@/lib/subscriptions';

export async function GET() {
  const subscriptions = getAllSubscriptions();
  
  return NextResponse.json({
    count: subscriptions.length,
    subscriptions: subscriptions.map((sub, index) => ({
      index: index + 1,
      endpoint: sub.endpoint,
    })),
  });
}

