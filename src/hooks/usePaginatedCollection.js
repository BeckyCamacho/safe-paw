
import { useCallback, useEffect, useRef, useState } from "react";
import { getDocs, query, limit, startAfter } from "firebase/firestore";


export default function usePaginatedCollection({ buildQuery, pageSize = 10, deps = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const lastDocRef = useRef(null);
  const resetFlag = useRef(0);

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const baseQ = buildQuery();
      const q = reset
        ? query(baseQ, limit(pageSize))
        : lastDocRef.current
          ? query(baseQ, startAfter(lastDocRef.current), limit(pageSize))
          : query(baseQ, limit(pageSize));

      const snap = await getDocs(q);

      if (reset) setItems([]);

      const batch = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems((prev) => (reset ? batch : [...prev, ...batch]));

      lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
      setHasMore(snap.docs.length === pageSize);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, pageSize]);

 
  useEffect(() => {
    lastDocRef.current = null;
    setHasMore(true);
    resetFlag.current++;
    load(true);
  
  }, deps); 

  const loadMore = useCallback(() => {
    if (!loading && hasMore) load(false);
  }, [hasMore, load, loading]);

  const reset = useCallback(() => {
    lastDocRef.current = null;
    setHasMore(true);
    load(true);
  }, [load]);

  return { items, loading, error, hasMore, loadMore, reset };
}
