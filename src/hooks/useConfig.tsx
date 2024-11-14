import { useEffect, useState } from 'react';

const useConfig = () => {
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/watch`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': localStorage.getItem('csrfToken'),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const { config } = await response.json();
        setConfig(config);
      } catch (err) {
        setError('Error loading config');
      }
    };

    fetchConfig();

    const interval = setInterval(fetchConfig, 10000);

    return () => clearInterval(interval);
  }, []);

  return { config, error };
};

export default useConfig;
