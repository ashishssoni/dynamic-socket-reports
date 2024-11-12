'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      router.push('/reports'); // Redirect to Reports Dashboard if authenticated
    } else {
      router.push('/login'); // Redirect to Login if no token
    }
  }, [router]);

  return null; // No need to render anything since this page redirects
};

export default Home;
