import { useState, useRef, useCallback } from 'react';
import { studyResponseSchema } from '../schemas/studySchema';

/**
 * Custom Hook: useGenerate
 * Handles natural AI study kit generation, friendly status updates,
 * AbortController cancellation, and Zod response validation.
 */
export function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [parseStatus, setParseStatus] = useState(null);

  const abortControllerRef = useRef(null);

  const generate = useCallback(async (textInput, topicHint = '', numCards = 10, numQuizzes = 5, options = {}, debugOverride = null) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    const agentName = options.provider === 'groq' ? 'Groq' : (options.provider === 'anthropic' ? 'Claude' : 'Gemini');
    setParseStatus(`✦ ${agentName} is thinking & analyzing your notes...`);

    // Friendly progressive status updates
    const statusTimer1 = setTimeout(() => {
      if (controller.signal.aborted) return;
      setParseStatus(`✦ Distilling core concepts & writing ${numCards} flashcards...`);
    }, 2200);

    const statusTimer2 = setTimeout(() => {
      if (controller.signal.aborted) return;
      setParseStatus(`✦ Crafting ${numQuizzes} interactive quiz questions...`);
    }, 4500);

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
          throw new Error("Network connection interrupted. Please try again.");
        }

        if (debugOverride === 'timeout') {
          throw new Error("Request timed out. Please try again.");
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textInput, 
          topicHint, 
          numCards, 
          numQuizzes,
          provider: options.provider || 'google',
          model: options.model,
          customApiKey: options.customApiKey
        }),
        signal: controller.signal
      });

      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}. Please check prompt and try again.`);
      }

      const rawJson = await response.json();

      if (controller.signal.aborted) return;

      setParseStatus("✦ Finalizing and organizing your study deck...");
      validateAndSetData(rawJson);

    } catch (err) {
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);

      if (err.name === 'AbortError') {
        return;
      }
      console.error("useGenerate Error:", err);
      setError(err.message || "Could not generate study kit. Please try again.");
      setLoading(false);
      setParseStatus(null);
    }
  }, []);

  const validateAndSetData = (rawPayload) => {
    const result = studyResponseSchema.safeParse(rawPayload);

    if (!result.success) {
      console.error("Zod Schema Validation Failure:", result.error.format());
      setError("We received the material but couldn't parse all cards. Please click generate again.");
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
      setError("Generation paused.");
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
