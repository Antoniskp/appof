'use client';

import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';

const highlights = [
  { label: 'Αποθηκευμένα άρθρα', value: '24' },
  { label: 'Συμμετοχές σε δημοσκοπήσεις', value: '18' },
  { label: 'Δημοφιλή θέματα', value: '7' },
];

const activity = [
  {
    title: 'Ψήφισες στη δημοσκόπηση «Οικονομία»',
    time: 'Πριν από 2 ώρες',
  },
  {
    title: 'Αποθήκευσες το άρθρο «Κλίμα και δράσεις»',
    time: 'Χθες στις 18:40',
  },
  {
    title: 'Έλαβες badge «Ενεργό μέλος»',
    time: '12 Απριλίου',
  },
];

const providerLabels: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
  facebook: 'Facebook',
};

export default function ProfilePage() {
  const { user, refresh, loading } = useAuth();

  useEffect(() => {
    if (!user && !loading) {
      refresh();
    }
  }, [user, loading, refresh]);

  if (loading) {
    return (
      <main className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 text-center">
            <h1 className="h4">Φόρτωση προφίλ...</h1>
            <p className="text-muted mb-0">
              Ελέγχουμε την ενεργή σας συνεδρία.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 text-center">
            <h1 className="h4">Δεν είστε συνδεδεμένοι</h1>
            <p className="text-muted">
              Συνδεθείτε για να δείτε τα προσωπικά σας στοιχεία και τη δραστηριότητα.
            </p>
            <a className="btn btn-primary" href="/auth">
              Μετάβαση στη σύνδεση
            </a>
          </div>
        </div>
      </main>
    );
  }

  const connectedProviders = user.providers ?? [];
  const providers = Object.keys(providerLabels).map((provider) => ({
    name: providerLabels[provider],
    status: connectedProviders.includes(provider) ? 'Συνδεδεμένο' : 'Μη συνδεδεμένο',
    statusClass: connectedProviders.includes(provider) ? 'text-success' : 'text-muted',
  }));

  return (
    <main className="container py-5">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 96, height: 96, fontSize: 32 }}
              >
                {(user.name ?? user.email)
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <h1 className="h4 mb-1">{user.name ?? 'Χρήστης Appof'}</h1>
              <p className="text-muted mb-3">{user.role ?? 'Member'}</p>
              <div className="d-grid gap-2">
                <button className="btn btn-primary">Επεξεργασία προφίλ</button>
                <button className="btn btn-outline-secondary">
                  Διαχείριση ειδοποιήσεων
                </button>
              </div>
            </div>
            <div className="border-top px-4 py-3">
              <h2 className="h6 text-uppercase text-muted">Στοιχεία</h2>
              <p className="mb-1">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="mb-1">
                <strong>Πόλη:</strong> Αθήνα
              </p>
              <p className="mb-0">
                <strong>Μέλος από:</strong> Μάρτιος 2024
              </p>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <h2 className="h5">Συνδεδεμένοι πάροχοι</h2>
              <div className="list-group list-group-flush">
                {providers.map((provider) => (
                  <div
                    key={provider.name}
                    className="list-group-item d-flex justify-content-between align-items-center px-0"
                  >
                    <span>{provider.name}</span>
                    <span className={`small fw-semibold ${provider.statusClass}`}>
                      {provider.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline-primary w-100 mt-3">
                Διαχείριση OAuth συνδέσεων
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="row g-4">
            {highlights.map((item) => (
              <div key={item.label} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 text-center">
                  <div className="card-body">
                    <p className="text-muted small mb-1">{item.label}</p>
                    <h3 className="h2 fw-bold mb-0">{item.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Πρόσφατη δραστηριότητα</h2>
                <button className="btn btn-sm btn-link text-decoration-none">
                  Προβολή όλων
                </button>
              </div>
              <div className="list-group list-group-flush">
                {activity.map((item) => (
                  <div key={item.title} className="list-group-item px-0">
                    <div className="d-flex justify-content-between">
                      <span>{item.title}</span>
                      <span className="text-muted small">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5">Ασφάλεια λογαριασμού</h2>
                  <p className="text-muted">
                    Ενημερώστε τον κωδικό σας και ενεργοποιήστε ισχυρότερη
                    προστασία.
                  </p>
                  <button className="btn btn-outline-primary w-100">
                    Αλλαγή κωδικού
                  </button>
                  <button className="btn btn-outline-secondary w-100 mt-2">
                    Ενεργοποίηση 2FA
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5">Προτιμήσεις περιεχομένου</h2>
                  <p className="text-muted">
                    Επιλέξτε τις ενότητες που θέλετε να βλέπετε πιο συχνά.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge text-bg-light border">Κοινωνία</span>
                    <span className="badge text-bg-light border">Τεχνολογία</span>
                    <span className="badge text-bg-light border">Οικονομία</span>
                    <span className="badge text-bg-light border">Εκπαίδευση</span>
                  </div>
                  <button className="btn btn-primary w-100 mt-3">
                    Ενημέρωση προτιμήσεων
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
