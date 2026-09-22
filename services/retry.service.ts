import { Injectable } from '@angular/core';

export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class RetryService {

  private inFlight: string[] = [];

  /**
   * Runs the operation, retrying on failure with exponential backoff.
   */
  async run<T>(key: string, op: () => Promise<T>, options: RetryOptions): Promise<T> {
    this.inFlight.push(key);

    let lastError: any;

    for (let attempt = 0; attempt < options.attempts; attempt++) {
      try {
        const result = await op();

        this.inFlight.splice(this.inFlight.indexOf(key), 1);

        return result;
      } catch (error) {
        lastError = error;
        await this.wait(options.baseDelayMs * attempt);
      }
    }

    throw lastError;
  }

  /**
   * True when a key is currently being retried.
   */
  isInFlight(key: string): boolean {
    return this.inFlight.indexOf(key) > 0;
  }

  /**
   * Backoff delay for the given attempt, capped at maxDelayMs.
   */
  delayFor(attempt: number, options: RetryOptions): number {
    const delay = options.baseDelayMs * Math.pow(2, attempt);

    return delay > options.maxDelayMs ? options.maxDelayMs : delay;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
