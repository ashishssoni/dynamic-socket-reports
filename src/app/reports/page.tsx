'use client';

import { useEffect, useState } from 'react';
import styles from './reports.module.css';
import { useRouter } from 'next/navigation';
import useSocket from '@/hooks/useSocket';

const ReportsPage = () => {
  const [reports, setReports] = useState<
    { fileName: string; userName: string; createdAt: string }[]
  >([]);
  const [error, setError] = useState('');
  const router = useRouter();

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const { isReportReady, acknowledgeReportReady, downloadReport } = useSocket();

  useEffect(() => {
    if (isReportReady) {
      setShowNotificationPopup(true);
    }
  }, [isReportReady]);

  const handleCloseNotificationPopup = () => {
    setShowNotificationPopup(false);
    acknowledgeReportReady();
  };

  useEffect(() => {
    const csrfToken = localStorage.getItem('csrfToken');

    if (!csrfToken) {
      setError('Authentication failed. Please log in again.');
      router.push('/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/report`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        const data = await response.json();
        setReports(data.reports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Failed to fetch reports.');
      }
    };

    fetchReports();
  }, [router]); // Adding router as a dependency

  const handleDownload = async (fileName: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/report/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': localStorage.getItem('csrfToken'),
        },
        body: JSON.stringify({ fileName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
      setError('Error downloading report.');
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Generated Reports</h1>

      {error && <div className={styles.error}>{error}</div>}

      {reports.length > 0 ? (
        <div className={styles.reportsCard}>
          <h2 className={styles.reportsTitle}>Reports List</h2>
          <table className={styles.reportsTable}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Created At</th>
                <th>Created By</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.fileName}>
                  <td>{report.fileName}</td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  <td>{report.userName}</td>
                  <td>
                    <button
                      className={styles.downloadButton}
                      onClick={() => handleDownload(report.fileName)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.noReports}>
          <p>No reports available at the moment.</p>
        </div>
      )}

      <button onClick={handleGoBack} className={styles.backButton}>
        Go Back to Dashboard
      </button>

      {showNotificationPopup && (
        <>
          <div className="overlay"></div>
          <div className={styles.notificationPopup}>
            <div className={styles.notificationContent}>
              <p>Your report is ready!</p>
              <button onClick={downloadReport} className={styles.downloadButton}>
                Download Report
              </button>
              <button onClick={handleCloseNotificationPopup} className={styles.closeButton}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
