'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './reports.module.css';

const ReportsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const sampleReports = [
      {
        _id: '1',
        title: 'Sales Report Q1',
        createdAt: '2024-01-15T10:30:00Z',
        createdBy: 'admin',
      },
      {
        _id: '2',
        title: 'Sales Report Q2',
        createdAt: '2024-04-15T10:30:00Z',
        createdBy: 'admin',
      },
      {
        _id: '3',
        title: 'User Activity Report',
        createdAt: '2024-07-15T10:30:00Z',
        createdBy: 'user',
      },
    ];
    setReports(sampleReports);

    // const fetchReports = async () => {
    //   try {
    //     const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/reports`);
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch reports');
    //     }
    //     const data = await response.json();
    //     setReports(data.reports);
    //   } catch (error) {
    //     // console.error('Error fetching reports:', error);
    //     // setError('Failed to fetch reports.');
    //   }
    // };

    // fetchReports();
  }, []);

  const handleDownload = (reportId: string) => {
    // Fetch the report file (e.g., in XLSX format) and trigger download
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/reports/${reportId}/download`)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `report_${reportId}.xlsx`;
        link.click();
      })
      .catch((error) => {
        console.error('Error downloading the report:', error);
      });
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
                <th>Name</th>
                <th>Created At</th>
                <th>Created By</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td>
                    <Link href={`/reports/${report._id}`} className={styles.reportLink}>
                      {report.title}
                    </Link>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  <td>{report.createdBy}</td>
                  <td>
                    <button
                      className={styles.downloadButton}
                      onClick={() => handleDownload(report._id)}
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
    </div>
  );
};

export default ReportsPage;
