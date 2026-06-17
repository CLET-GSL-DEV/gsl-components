import { useState, useEffect, useRef } from "react";

export function useMockQuery<T>(data: T, delayMs = 1000): { data: T | null; loading: boolean } {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<T | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setResult(null);
    const timer = setTimeout(() => {
      if (cancelled) return;
      setResult(dataRef.current);
      setLoading(false);
    }, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [delayMs]);

  return { data: result, loading };
}
