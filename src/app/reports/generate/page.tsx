// /app/reports/generate/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './generate.module.css';

const GenerateReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Perform any necessary actions when the page loads
    console.log('Generate Report Page Loaded');
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Report is being generated!');
        router.push('/dashboard'); // Redirect after report generation is triggered
      } else {
        throw new Error('Failed to generate report.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}> Generate Report </h1>

      {error && <div className={styles.error}> {error} </div>}

      <div className={styles.card}>
        <p>Click the button below to generate the report.</p>
        <button
          className={styles.generateReportButton}
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  );
};

export default GenerateReportPage;
