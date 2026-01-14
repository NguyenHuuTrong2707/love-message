import { NextResponse } from 'next/server';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";

export async function GET() {
  if (!VAPID_PUBLIC_KEY) {
    return NextResponse.json(
      { error: "VAPID_PUBLIC_KEY chưa được cấu hình" },
      { status: 500 }
    );
  }
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY });
}

