import { useState, useRef, useCallback } from 'react';
import { studyResponseSchema } from '../schemas/studySchema';

/**
 * Custom Hook: useGenerate
 * Handles AI generation API requests, AbortController cancellation,
 * Zod response validation, error states, and dev debug overrides.
 */
export function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [parseStatus, setParseStatus] = useState(null);

  const abortControllerRef = useRef(null);

  const generate = useCallback(async (textInput, topicHint = '', numCards = 10, numQuizzes = 5, debugOverride = null) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setParseStatus("Sending material to AI engine...");

    try {
      if (debugOverride) {
        await new Promise(r => setTimeout(r, 600));

        if (controller.signal.aborted) return;

        if (debugOverride === 'malformed') {
          const malformedPayload = { topic: "Test Topic", blocks: [{ type: "unknown_type", items: [] }] };
          validateAndSetData(malformedPayload);
          return;
        }

        if (debugOverride === 'empty') {
          validateAndSetData({});
          return;
        }

        if (debugOverride === 'network') {
          throw new Error("Network connection failed (Simulated 500 Server Error)");
        }

        if (debugOverride === 'timeout') {
          throw new Error("Request timed out after 10,000ms (Simulated Timeout)");
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput, topicHint, numCards, numQuizzes }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const rawJson = await response.json();

      if (controller.signal.aborted) return;

      setParseStatus("Validating structured response with Zod...");
      validateAndSetData(rawJson);

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log("Generation request was aborted by user or newer request.");
        return;
      }
      console.error("useGenerate Error:", err);
      setError(err.message || "An unexpected error occurred during study material generation.");
      setLoading(false);
      setParseStatus(null);
    }
  }, []);

  const validateAndSetData = (rawPayload) => {
    const result = studyResponseSchema.safeParse(rawPayload);

    if (!result.success) {
      console.error("Zod Schema Validation Failure:", result.error.format());
      const firstError = result.error.errors[0]?.message || "Schema mismatch";
      setError(`Data Validation Failed: ${firstError}. Please retry or edit prompt.`);
      setData(null);
    } else {
      setData(result.data);
      setError(null);
    }

    setLoading(false);
    setParseStatus(null);
  };

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setParseStatus(null);
      setError("Generation canceled by user.");
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setParseStatus(null);
  }, []);

  return {
    generate,
    cancel,
    reset,
    loading,
    error,
    data,
    setData,
    parseStatus
  };
}
