import { clsx, type ClassValue } from "clsx"
import type { Message } from "../features/analysis/types"

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs)
}

/**
 * Aggregate daily activity from messages
 * Used for timeline/heatmap visualizations
 */
export function aggregateDailyActivity(
  messages: Message[]
): Array<{ date: string; messageCount: number }> {
  const activityMap = new Map<string, { date: string; messageCount: number }>();
  
  for (const message of messages) {
    if (!message.sentAt) continue;
    const d = new Date(message.sentAt);
    if (Number.isNaN(d.getTime())) continue;
    const dateKey = d.toISOString().split('T')[0];
    const existing = activityMap.get(dateKey);
    if (existing) {
      existing.messageCount += 1;
    } else {
      activityMap.set(dateKey, { date: dateKey, messageCount: 1 });
    }
  }
  
  return Array.from(activityMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * Sanitize file name to prevent path traversal and log injection
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and dangerous characters
  // Keep only alphanumeric, dots, dashes, underscores
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255); // Limit length
}

/**
 * Escape HTML to prevent XSS attacks
 * Simple HTML entity encoding for safe innerHTML usage
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Explicit exports to help bundlers statically detect names
export { cn as cnFn };



