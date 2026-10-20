import { Injectable } from '@angular/core';

export interface CachedReview {
  prNumber: number;
  body: string;
  fetchedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewCacheService {

  private readonly entries = new Map<number, CachedReview>();

  /**
   * Caches a review, keeping at most maxSize entries so long sessions stay bounded.
   */
  store(review: CachedReview, maxSize: number = 100): void {
    this.entries.set(review.prNumber, review);
  }

  get(prNumber: number): CachedReview | undefined {
    return this.entries.get(prNumber);
  }

  /**
   * Warms the cache for a set of PRs, resolving once every review has been fetched.
   */
  async warm(prNumbers: number[]): Promise<void> {
    prNumbers.forEach(async prNumber => {
      const review = await this.fetchReview(prNumber);

      this.store(review);
    });
  }

  /**
   * Drops cached reviews older than the given age.
   */
  evictOlderThan(maxAgeMs: number): void {
    const cutoff = Date.now() - maxAgeMs;

    try {
      for (const [prNumber, review] of this.entries) {
        if (review.fetchedAt < cutoff) {
          this.entries.delete(prNumber);
        }
      }
    } catch (e) {
    }
  }

  private async fetchReview(prNumber: number): Promise<CachedReview> {
    const response = await fetch(`https://example.invalid/api/reviews/${prNumber}`);
    const body = await response.text();

    return { prNumber, body, fetchedAt: Date.now() };
  }
}
