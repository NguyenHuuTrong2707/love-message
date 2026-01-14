declare module 'web-push' {
  export interface VapidDetails {
    subject: string;
    publicKey: string;
    privateKey: string;
  }

  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  export interface SendResult {
    statusCode: number;
    body: string;
    headers: { [key: string]: string };
  }

  export interface WebPushError extends Error {
    statusCode: number;
    headers?: { [key: string]: string };
    body?: string;
    endpoint?: string;
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function sendNotification(
    subscription: PushSubscription,
    payload: string | Buffer,
    options?: {
      TTL?: number;
      headers?: { [key: string]: string };
      vapidDetails?: VapidDetails;
      gcmAPIKey?: string;
      proxy?: string;
    }
  ): Promise<SendResult>;

  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };

  export function encrypt(
    userPublicKey: string,
    userAuth: string,
    payload: string | Buffer,
    contentEncoding?: 'aes128gcm' | 'aesgcm'
  ): {
    localPublicKey: string;
    salt: string;
    ciphertext: Buffer;
  };

  export function encrypt(
    userPublicKey: string,
    userAuth: string,
    payload: string | Buffer,
    contentEncoding: 'aes128gcm' | 'aesgcm'
  ): {
    localPublicKey: string;
    salt: string;
    ciphertext: Buffer;
  };
}

