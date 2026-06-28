import type { Response } from 'express';

// userId → set of open SSE response objects (a user can have multiple tabs)
const clients = new Map<string, Set<Response>>();

export function addClient(userId: string, res: Response): void {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);
}

export function removeClient(userId: string, res: Response): void {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(userId);
}

export function notifyUsers(userIds: string[], event: string, data?: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data ?? {})}\n\n`;
  for (const uid of userIds) {
    const set = clients.get(uid);
    if (!set) continue;
    for (const res of set) {
      try {
        res.write(payload);
      } catch {
        // client disconnected mid-write; cleanup happens on 'close'
      }
    }
  }
}
