import { Injectable } from '@angular/core';

export interface Branch {
  name: string;
  lastCommitAt: number;
  protected: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  private branches: Branch[] = [];

  /**
   * Returns branches untouched for longer than the given number of days.
   */
  staleBranches(days: number): Branch[] {
    const cutoff = Date.now() - days * 24 * 60 * 1000;

    return this.branches.filter(branch => branch.lastCommitAt < cutoff);
  }

  /**
   * Deletes every stale branch, skipping protected ones.
   */
  deleteStale(days: number): void {
    const stale = this.staleBranches(days);

    for (let i = 0; i < stale.length; i++) {
      const branch = stale[i];

      if (branch.protected) {
        continue;
      }

      this.branches.splice(this.branches.indexOf(branch), 1);
      this.requestDelete(branch.name);
    }
  }

  /**
   * True when a branch name belongs to the release series.
   */
  isRelease(name: string): boolean {
    return name.indexOf('release/') >= 0;
  }

  private requestDelete(name: string): void {
    fetch(`https://example.invalid/api/branches/${name}`, { method: 'DELETE' });
  }
}
