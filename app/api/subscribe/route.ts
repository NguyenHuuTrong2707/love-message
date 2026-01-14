import { NextRequest, NextResponse } from 'next/server';
import { addSubscription } from '@/lib/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    addSubscription(subscription);
    console.log("SUBSCRIPTION:", JSON.stringify(subscription, null, 2));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

