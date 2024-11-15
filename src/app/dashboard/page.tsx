'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import useSocket from '../../hooks/useSocket';
import useConfig from '@/hooks/useConfig';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const { isReportReady, acknowledgeReportReady, downloadReport } = useSocket();

  useConfig();

  useEffect(() => {
    if (isReportReady) {
      downloadReport();
      setTimeout(() => {
        setShowNotificationPopup(true);
      }, 3000);
    }
  }, [isReportReady]);

  const handleCloseNotificationPopup = () => {
    setShowNotificationPopup(false);
    acknowledgeReportReady();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const csrfToken = localStorage.getItem('csrfToken');

        if (!csrfToken) {
          setError('Authentication failed. Please log in again.');
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const { user } = await response.json();
        setUserData(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('An error occurred while fetching the user data.');
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  const logout = () => {
    localStorage.removeItem('csrfToken');
    router.push('/login');
  };

  const generateReport = () => {
    router.push('/reports/generate');
  };

  const goToReports = () => {
    router.push('/reports');
  };

  return (
    <div className={styles.container}>
      <button onClick={logout} className={styles.logoutButton}>
        Logout
      </button>
      <h1 className={styles.header}>User Dashboard</h1>

      {error && <div className={styles.error}>{error}</div>}

      {userData ? (
        <div className={styles.card}>
          <h2>Welcome back, {userData.name}!</h2>
          <p>Email: {userData.email}</p>
          <p>Role: {userData.role}</p>

          <div className={styles.buttonGroup}>
            <button onClick={generateReport} className={styles.generateReportButton}>
              Generate Reports
            </button>

            <button onClick={goToReports} className={styles.reportsButton}>
              Your Reports
            </button>
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

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

export default UserDashboard;
