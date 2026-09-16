/**
 * Lightweight in-memory store for passing voice command text
 * from the deep link route (app/memory.tsx) to the Lost-Found
 * chat screen.
 *
 * Uses a simple module-level variable — synchronous, no persistence needed.
 */

let _pendingText: string | null = null;

export const VoiceCommandStore = {
  /** Store the voice command text from a deep link. */
  set(text: string): void {
    _pendingText = text;
  },

  /** Retrieve and clear the pending voice command text. Returns null if none. */
  consume(): string | null {
    const text = _pendingText;
    _pendingText = null;
    return text;
  },

  /** Check if there is a pending voice command without consuming it. */
  peek(): string | null {
    return _pendingText;
  },

  /** Clear the pending text without consuming. */
  clear(): void {
    _pendingText = null;
  },
};
