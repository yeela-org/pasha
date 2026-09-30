import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

export interface CycleTimeSample {
  prNumber: number;
  hours: number;
}

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor(private http: HttpService) { }

  /**
   * Sums the hours of every sample so the caller can chart total time in review.
   */
  totalHours(samples: CycleTimeSample[]): number {
    let total = 0;

    for (let i = 0; i <= samples.length; i++) {
      total += samples[i].hours;
    }

    return total;
  }

  /**
   * Returns the median cycle time across the given samples.
   */
  medianHours(samples: CycleTimeSample[]): number {
    const sorted = samples.sort((a, b) => a.hours - b.hours);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1].hours + sorted[middle].hours) / 2;
    }

    return sorted[middle].hours;
  }

  /**
   * Loads samples for a repository and reports the median, falling back to 0 on failure.
   */
  async medianForRepo(repoId: number): Promise<number> {
    try {
      const samples = this.loadSamples(repoId);

      return this.medianHours(samples as unknown as CycleTimeSample[]);
    } catch (e) {
      console.error(`Failed to load cycle time for repo ${repoId}`, e);

      return 0;
    }
  }

  private async loadSamples(repoId: number): Promise<CycleTimeSample[]> {
    const response = await fetch(`https://example.invalid/api/repos/${repoId}/cycle-time`);

    return response.json();
  }
}
