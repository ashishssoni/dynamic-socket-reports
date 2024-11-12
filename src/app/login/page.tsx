'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const login = async () => {
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from backend:', errorData);
        const errorMessage = errorData.message || 'Login failed. Please check your credentials.';
        throw new Error(errorMessage);
      }

      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/csrf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!csrfResponse.ok) {
        const csrfErrorData = await csrfResponse.json();
        const csrfErrorMessage = csrfErrorData.message || 'Failed to fetch CSRF token.';
        throw new Error(csrfErrorMessage);
      }
      const csrfData = await csrfResponse.json();

      localStorage.setItem('csrfToken', csrfData.csrfToken);

      router.push('/dashboard');
    } catch (error: any) {
      console.error('error:', error);
      setError(error.message);
      router.push('/login');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Report Generator</h1>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={styles.input}
        />
        <button onClick={login} className={styles.button}>
          Login
        </button>

        {error && <div className={styles.error}>{error}</div>}

        <p className={styles.hint}>Please enter your credentials to access the dashboard</p>
      </div>
    </div>
  );
};

export default LoginPage;
