import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { RigvedaVerse } from '@/types/rigveda';

export const useRigvedaData = () => {
  const [data, setData] = useState<RigvedaVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/rigveda_with_translit.csv');
        const csvText = await response.text();
        
        Papa.parse<RigvedaVerse>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
            setLoading(false);
          },
          error: (err) => {
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Failed to load Rigveda data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};
