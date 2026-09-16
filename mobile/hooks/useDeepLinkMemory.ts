/**
 * useDeepLinkMemory – listens for incoming deep links of the form
 * `mobile://memory?text=...` (triggered by Google Assistant / "Hey Google")
 * and extracts the voice command text.
 *
 * Handles both:
 *  - Cold start: app was closed, opened via deep link (getInitialURL)
 *  - Warm start: app was in background, receives linking event (addEventListener)
 *
 * Returns the pending text and a clear function.
 * The text is one-shot: once consumed and cleared, it won't re-trigger.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import * as Linking from "expo-linking";

/**
 * Parses a deep link URL and extracts the `text` query parameter
 * if the URL matches the `mobile://memory` scheme+host.
 */
function extractMemoryText(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = Linking.parse(url);

    // Match "mobile://memory?text=..." deep links
    // Linking.parse normalizes scheme://host/path → hostname = "memory"
    if (
      parsed.hostname === "memory" ||
      parsed.path === "memory" ||
      parsed.path === "/memory"
    ) {
      const text =
        parsed.queryParams?.text;

      if (typeof text === "string" && text.trim().length > 0) {
        return decodeURIComponent(text.trim());
      }
    }
  } catch {
    // Malformed URL – ignore silently
  }

  return null;
}

export interface DeepLinkMemoryResult {
  /** The voice command text extracted from the deep link, or null if none. */
  pendingText: string | null;
  /** Call this after processing the text to prevent re-triggering. */
  clearPendingText: () => void;
}

export function useDeepLinkMemory(): DeepLinkMemoryResult {
  const [pendingText, setPendingText] = useState<string | null>(null);
  const processedUrls = useRef<Set<string>>(new Set());

  const handleUrl = useCallback((url: string) => {
    // Prevent processing the same URL twice (e.g. on re-render)
    if (processedUrls.current.has(url)) return;

    const text = extractMemoryText(url);
    if (text) {
      processedUrls.current.add(url);
      setPendingText(text);
    }
  }, []);

  useEffect(() => {
    // Cold start: check if the app was opened via a deep link
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleUrl(initialUrl);
      }
    };

    checkInitialUrl();

    // Warm start: listen for incoming deep links while app is open
    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleUrl]);

  const clearPendingText = useCallback(() => {
    setPendingText(null);
  }, []);

  return { pendingText, clearPendingText };
}
