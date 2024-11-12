'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

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

        if (!response.status) {
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

          {/* Button group container */}
          <div className={styles.buttonGroup}>
            {/* Generate Reports Button */}
            <button onClick={generateReport} className={styles.generateReportButton}>
              Generate Reports
            </button>

            {/* Your Reports Button */}
            <button onClick={goToReports} className={styles.reportsButton}>
              Your Reports
            </button>
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default UserDashboard;
