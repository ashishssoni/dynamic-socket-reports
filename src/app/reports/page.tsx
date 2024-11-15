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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const router = useRouter();

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const { isReportReady, acknowledgeReportReady, downloadReport } = useSocket();

  useEffect(() => {
    if (isReportReady) {
      downloadReport();
      setTimeout(() => {
        setShowNotificationPopup(true);
      }, 5000);
    }
  }, [isReportReady]);

  const handleCloseNotificationPopup = () => {
    setShowNotificationPopup(false);
    acknowledgeReportReady();
  };

  useEffect(() => {
    if (search.length >= 3 || search === '') {
      const timeoutId = setTimeout(() => {
        setDebouncedSearch(search);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [search]);

  const fetchReports = async () => {
    const csrfToken = localStorage.getItem('csrfToken');

    if (!csrfToken) {
      setError('Authentication failed. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/report?` +
          new URLSearchParams({
            page: pagination.page.toString(),
            limit: pagination.limit.toString(),
            sortBy: pagination.sortBy,
            sortOrder: pagination.sortOrder,
            search: debouncedSearch,
          }),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const { reports, pagination: apiPagination } = await response.json();

      setReports(reports);
      setPagination((prev) => ({
        ...prev,
        total: apiPagination.total,
        totalPages: Math.ceil(apiPagination.total / pagination.limit),
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports.');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pagination.page, pagination.limit, pagination.sortBy, pagination.sortOrder, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

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

  const handleConfigDownload = async (fileName: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/report-config/download`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': localStorage.getItem('csrfToken'),
          },
          body: JSON.stringify({ fileName }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const modifiedFilename = fileName.split('.')[0];
      link.href = url;
      link.setAttribute('download', `${modifiedFilename}_report_config.json`);
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

      <div className={styles.searchContainer}>
        <div className={styles.searchBarWrapper}>
          <i className={`fas fa-search ${styles.searchIcon}`} />
          <input
            type="text"
            placeholder="Search by file name"
            className={styles.searchBar}
            value={search}
            onChange={handleSearchChange}
          />
          {search && (
            <button className={styles.clearButton} onClick={() => setSearch('')}>
              &times;
            </button>
          )}
        </div>
      </div>

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
                <th>File</th>
                <th>Report Config</th>
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
                  <td>
                    <button
                      className={styles.downloadButton}
                      onClick={() => handleConfigDownload(report.fileName)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className={styles.paginationControls}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.noReports}>
          <p>No reports found. Try again later!</p>
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
