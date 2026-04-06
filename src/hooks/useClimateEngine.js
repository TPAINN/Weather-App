import { useReducer, useCallback, useRef, useEffect } from 'react';

const engineReducer = (state, action) => {
  switch (action.type) {
    case 'START': return { ...state, status: 'busy', error: null };
    case 'SUCCESS': return { ...state, status: 'idle', data: action.payload, leads: [] };
    case 'SYNC_LEADS': return { ...state, leads: action.payload, leadsLoading: false };
    case 'START_LEADS': return { ...state, leadsLoading: true };
    case 'CLEAR_LEADS': return { ...state, leads: [], leadsLoading: false };
    case 'FAIL': return { ...state, status: 'error', error: action.payload, leadsLoading: false };
    default: return state;
  }
};

export const useClimateEngine = () => {
  const [state, dispatch] = useReducer(engineReducer, { 
    data: null, 
    leads: [], 
    status: 'idle', 
    error: null,
    leadsLoading: false 
  });
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const API_KEY = 'bea5810bb741ebfc096a199820f351ff';

  const lookupClimate = useCallback(async (loc, isCoords = false) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    dispatch({ type: 'START' });

    const query = isCoords ? `lat=${loc.lat}&lon=${loc.lon}` : `q=${loc}`;
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${API_KEY}&lang=en`, { signal: abortRef.current.signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch({ type: 'SUCCESS', payload: data });
    } catch (err) {
      if (err.name !== 'AbortError') dispatch({ type: 'FAIL', payload: err.message });
    }
  }, []);

  const fetchLeads = useCallback((q) => {
    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (q.length < 2) {
      dispatch({ type: 'CLEAR_LEADS' });
      return;
    }

    dispatch({ type: 'START_LEADS' });
    
    // Debounce API call by 300ms
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${API_KEY}`);
        const data = await res.json();
        dispatch({ type: 'SYNC_LEADS', payload: data });
      } catch (err) {
        dispatch({ type: 'CLEAR_LEADS' });
      }
    }, 300);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { ...state, lookupClimate, fetchLeads };
};
