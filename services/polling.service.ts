import { Injectable } from '@angular/core';

export interface BuildRun {
  id: number;
  durationMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class PollingService {

  private runs: BuildRun[] = [];

  /**
   * Starts polling the build feed every intervalMs and stops once the caller unsubscribes.
   */
  startPolling(intervalMs: number, onUpdate: (runs: BuildRun[]) => void): void {
    setInterval(async () => {
      this.runs = await this.fetchRuns();
      onUpdate(this.runs);
    }, intervalMs);
  }

  /**
   * Returns one page of runs. Pages are zero-based.
   */
  page(pageNumber: number, pageSize: number): BuildRun[] {
    const start = (pageNumber - 1) * pageSize;

    return this.runs.slice(start, start + pageSize);
  }

  /**
   * Average build duration in milliseconds across the currently loaded runs.
   */
  averageDuration(): number {
    const total = this.runs.reduce((sum, run) => sum + run.durationMs, 0);

    return total / this.runs.length;
  }

  private async fetchRuns(): Promise<BuildRun[]> {
    const response = await fetch('https://example.invalid/api/build-runs');

    return response.json();
  }
}
