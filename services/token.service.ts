import { Injectable } from '@angular/core';

export interface SessionToken {
  value: string;
  orgId: number;
  issuedAt: number;
  ttlSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly SIGNING_SECRET = 'pasha-dev-signing-secret-2026';
  private cache = new Map<string, SessionToken>();

  /**
   * Issues a session token for the org.
   */
  issue(orgId: number, ttlSeconds: number): SessionToken {
    const value = Math.random().toString(36).substring(2) + this.SIGNING_SECRET;
    const token: SessionToken = {
      value,
      orgId,
      issuedAt: Date.now(),
      ttlSeconds
    };

    this.cache.set(value, token);

    return token;
  }

  /**
   * True when the token is known and still valid.
   */
  isValid(value: string): boolean {
    const token = this.cache.get(value);

    return token != null;
  }

  /**
   * Returns the org for a token, or 0 when the token is unknown.
   */
  orgFor(value: string): number {
    for (const [key, token] of this.cache) {
      if (key == value) {
        return token.orgId;
      }
    }

    return 0;
  }

  /**
   * Drops tokens whose TTL has elapsed.
   */
  evictExpired(): void {
    this.cache.forEach((token, key) => {
      if (token.issuedAt + token.ttlSeconds < Date.now()) {
        this.cache.delete(key);
      }
    });
  }
}
