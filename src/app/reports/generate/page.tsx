'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './generate.module.css';
import useSocket from '../../../hooks/useSocket';

const GenerateReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [config, setConfig] = useState<any>({ columns: [] });
  const [newColumn, setNewColumn] = useState({ header: '', path: '' });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const router = useRouter();

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);

  const {
    isReportReady,
    acknowledgeReportReady,
    downloadReport,
    configUpdated: reportConfig,
  } = useSocket();

  let csrfToken = null;
  if (typeof window !== 'undefined') {
    csrfToken = localStorage.getItem('csrfToken');
  }

  useEffect(() => {
    const initiateDownload = async () => {
      try {
        await downloadReport();
        setShowNotificationPopup(true);
      } catch (error) {
        console.error('Error during report download:', error);
        setError('Error in Generating Reports');

        setTimeout(() => {
          setError('');
        }, 3000);
      }
    };

    if (isReportReady) {
      initiateDownload();
    }
  }, [isReportReady]);

  useEffect(() => {
    if (reportConfig) {
      setConfig(reportConfig);
      setUpdateMessage('The report configuration has been updated!');
      setShowUpdateMessage(true);

      setTimeout(() => {
        setShowUpdateMessage(false);
      }, 2000);
    }
  }, [reportConfig]);

  const handleCloseNotificationPopup = () => {
    setShowNotificationPopup(false);
    acknowledgeReportReady();
    setSuccess(false);
  };

  useEffect(() => {
    const fetchReportConfig = async () => {
      try {
        if (!csrfToken) {
          setError('Authentication failed. Please log in again.');
          router.push('/login');
          return;
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/report-config`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report config.');
        }

        const data = await response.json();

        setConfig(data.reportsConfig);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchReportConfig();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setUpdateSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/report/generate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error('No reports found, please check the data.');
      }

      setSuccess(true);
    } catch (error: any) {
      console.error('Error generating report:', error);
      setError(error.message || 'No reports found, please check the data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    if (newColumn.header && newColumn.path) {
      setConfig((prevConfig: any) => ({
        ...prevConfig,
        columns: [...prevConfig.columns, newColumn],
      }));
      setNewColumn({ header: '', path: '' });
      setUnsavedChanges(true);
    } else {
      setError('Please fill out both the column header and path.');
    }
  };

  const handleRemoveColumn = (index: number) => {
    setConfig((prevConfig: any) => ({
      ...prevConfig,
      columns: prevConfig.columns.filter((_, i) => i !== index),
    }));
    setUnsavedChanges(true);
  };

  const handleUpdateConfig = async () => {
    try {
      const response: any = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/report-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(config),
      }).catch((err) => {
        console.log('err', err);
      });

      if (response?.status !== 200) {
        const { message } = await response.json();
        throw new Error(message);
      }

      setUpdateSuccess(true);
      setTimeout(() => {
        setFadeOut(true);
      }, 2000);

      setUnsavedChanges(false);

      setTimeout(() => {
        setUpdateSuccess(false);
        setFadeOut(false);
      }, 4000);
    } catch (error: any) {
      console.error('Error updating config:', error);
      setError(error.message);

      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}> Generate Report </h1>

      {error && <div className={styles.error}>{error}</div>}

      {success && (
        <div className={styles.success}>Report is being generated. Please check back later.</div>
      )}

      <div className={styles.card}>
        <p>Click the button below to generate the report with the selected configuration.</p>
        <button
          className={styles.generateReportButton}
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>

        <br />
        <button onClick={handleGoBack} className={styles.backButton}>
          Go Back to Dashboard
        </button>
      </div>

      <div className={styles.configCard}>
        <h2>Update Report Configuration</h2>

        <div className={styles.configInputs}>
          <input
            type="text"
            placeholder="Column Header"
            value={newColumn.header}
            onChange={(e) => setNewColumn({ ...newColumn, header: e.target.value })}
          />
          <input
            type="text"
            placeholder="Path (e.g., user.name)"
            value={newColumn.path}
            onChange={(e) => setNewColumn({ ...newColumn, path: e.target.value })}
          />
          <button onClick={handleAddColumn} className={styles.addColumnButton}>
            Add Column
          </button>
        </div>

        <div className={styles.columnsList}>
          {config.columns.map((column: any, index: number) => (
            <div key={index} className={styles.columnItem}>
              <span className={styles.columnText}>
                <strong>{column.header} :</strong>{' '}
                <span className={styles.columnPath}>{column.path}</span>
              </span>
              <button
                onClick={() => handleRemoveColumn(index)}
                className={styles.removeColumnButton}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {unsavedChanges && (
          <div className={styles.unsavedChanges}>
            <p>There are unsaved changes!</p>
          </div>
        )}

        <button onClick={handleUpdateConfig} className={styles.updateConfigButton}>
          {loading ? 'Updating...' : 'Update Configuration'}
        </button>

        {updateSuccess && (
          <div className={`${styles.success} ${fadeOut ? styles.fadeOut : ''}`}>
            Updated successfully
          </div>
        )}
      </div>
      <div>
        {/* Bottom Left Message for Config Update */}
        {showUpdateMessage && (
          <div className={styles.updateMessage}>
            <p>{updateMessage}</p>
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showNotificationPopup && (
        <>
          <div className="overlay"></div>
          <div className={styles.notificationPopup}>
            <div className={styles.notificationContent}>
              <p>Your report is ready. The download has started!</p>
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

export default GenerateReportPage;
