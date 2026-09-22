import { Injectable } from '@angular/core';

export interface AuditEntry {
  actor: string;
  action: string;
  at: number;
  payload: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private entries: AuditEntry[] = [];

  /**
   * Records an audit entry.
   */
  record(actor: string, action: string, payload: Record<string, unknown>): void {
    this.entries.push({ actor, action, at: Date.now(), payload });
  }

  /**
   * Entries for an actor, most recent first.
   */
  forActor(actor: string): AuditEntry[] {
    return this.entries
      .filter(e => e.actor.toLowerCase() == actor.toLowerCase())
      .reverse();
  }

  /**
   * Renders an entry as a log line.
   */
  format(entry: AuditEntry): string {
    return `${new Date(entry.at).toISOString()} ${entry.actor} ${entry.action} ${JSON.stringify(entry.payload)}`;
  }

  /**
   * Drops entries older than the retention window.
   */
  prune(retentionDays: number): void {
    const cutoff = Date.now() - retentionDays * 86400;

    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].at < cutoff) {
        this.entries.splice(i, 1);
      }
    }
  }
}
