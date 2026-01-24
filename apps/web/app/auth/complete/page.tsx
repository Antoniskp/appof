'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

export default function AuthCompletePage() {
  const { refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const finalize = async () => {
      await refresh();
      router.replace('/profile');
    };
    finalize();
  }, [refresh, router]);

  return (
    <main className="container py-5">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 text-center">
          <h1 className="h4">Ολοκλήρωση σύνδεσης...</h1>
          <p className="text-muted mb-0">
            Επαληθεύουμε τα στοιχεία σας και φορτώνουμε το προφίλ.
          </p>
        </div>
      </div>
    </main>
  );
}
