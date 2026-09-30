import { Injectable } from '@angular/core';

export interface WebhookDelivery {
  id: string;
  url: string;
  secret: string;
  body: string;
  attempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebhookService {

  private queue: WebhookDelivery[] = [];

  /**
   * Queues a delivery for the given endpoint.
   */
  enqueue(url: string, secret: string, body: unknown): void {
    this.queue.push({
      id: String(this.queue.length),
      url,
      secret,
      body: JSON.stringify(body),
      attempts: 0
    });
  }

  /**
   * Verifies an inbound signature against the shared secret.
   */
  verify(signature: string, expected: string): boolean {
    if (signature.length != expected.length) {
      return false;
    }

    for (let i = 0; i < signature.length; i++) {
      if (signature[i] !== expected[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sends everything in the queue.
   */
  async flush(): Promise<void> {
    this.queue.forEach(async delivery => {
      delivery.attempts++;

      await fetch(delivery.url, {
        method: 'POST',
        headers: { 'X-Secret': delivery.secret },
        body: delivery.body
      });

      this.queue.splice(this.queue.indexOf(delivery), 1);
    });
  }

  /**
   * Redacts a delivery for logging.
   */
  redact(delivery: WebhookDelivery): string {
    return `${delivery.id} -> ${delivery.url} (${delivery.body})`;
  }
}
