'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const oauthProviders = [
  {
    name: 'Google',
    description: 'Σύνδεση με τον Google λογαριασμό σας',
    buttonClass: 'btn-outline-danger',
    href: `${API_URL}/auth/oauth/google`,
  },
  {
    name: 'GitHub',
    description: 'Χρησιμοποιήστε το GitHub για γρήγορη πρόσβαση',
    buttonClass: 'btn-outline-dark',
    href: `${API_URL}/auth/oauth/github`,
  },
  {
    name: 'Facebook',
    description: 'Συνεχίστε με το προφίλ σας στο Facebook',
    buttonClass: 'btn-outline-primary',
    href: `${API_URL}/auth/oauth/facebook`,
  },
];

const benefits = [
  'Εξατομικευμένες ροές ειδήσεων και ειδοποιήσεις.',
  'Συμμετοχή σε δημοσκοπήσεις και συζητήσεις της κοινότητας.',
  'Αποθήκευση άρθρων για ανάγνωση αργότερα.',
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [signupState, setSignupState] = useState({
    name: '',
    email: '',
    password: '',
    acceptTerms: false,
  });
  const [loginState, setLoginState] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!signupState.acceptTerms) {
      setError('Αποδεχθείτε τους όρους χρήσης για να συνεχίσετε.');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: signupState.email,
        password: signupState.password,
        name: signupState.name,
      });
      setSuccess('Η εγγραφή ολοκληρώθηκε. Καλώς ήρθατε!');
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την εγγραφή.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await login(loginState);
      setSuccess('Επιτυχής σύνδεση. Μεταβείτε στο προφίλ σας.');
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τη σύνδεση.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="row align-items-start g-4">
        <div className="col-lg-4">
          <div className="sticky-lg-top" style={{ top: '5rem' }}>
            <h1 className="display-6 fw-bold mb-3">Καλώς ήρθατε στο Appof</h1>
            <p className="text-muted">
              Δημιουργήστε τον λογαριασμό σας ή συνδεθείτε για να συνεχίσετε την
              εμπειρία σας με προσωποποιημένα νέα.
            </p>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5">Τι κερδίζετε</h2>
                <ul className="list-unstyled text-muted small mb-0">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="d-flex gap-2 mb-2">
                      <span className="text-primary">●</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="h4 mb-1">Σύνδεση με OAuth</h2>
                      <p className="text-muted mb-0">
                        Επιλέξτε τον πάροχο που προτιμάτε.
                      </p>
                    </div>
                    <span className="badge bg-success-subtle text-success">
                      Ασφαλής επαλήθευση
                    </span>
                  </div>
                  <div className="row g-3">
                    {oauthProviders.map((provider) => (
                      <div key={provider.name} className="col-md-4">
                        <div className="border rounded-3 p-3 h-100">
                          <h3 className="h6 fw-semibold">{provider.name}</h3>
                          <p className="small text-muted">
                            {provider.description}
                          </p>
                          <a
                            className={`btn ${provider.buttonClass} w-100`}
                            href={provider.href}
                          >
                            Συνέχεια με {provider.name}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="alert alert-light border mt-4 mb-0">
                    <strong>Σημείωση:</strong> Θα ζητηθούν μόνο τα βασικά στοιχεία
                    προφίλ που απαιτούνται για την ενεργοποίηση του λογαριασμού σας.
                  </div>
                </div>
              </div>
            </div>

            {(error || success) && (
              <div className="col-12">
                <div
                  className={`alert ${error ? 'alert-danger' : 'alert-success'} mb-0`}
                  role="alert"
                >
                  {error ?? success}
                </div>
              </div>
            )}

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h2 className="h4">Δημιουργία λογαριασμού</h2>
                  <p className="text-muted">
                    Συμπληρώστε τα στοιχεία σας για εγγραφή με email.
                  </p>
                  <form className="d-grid gap-3" onSubmit={handleSignup}>
                    <div>
                      <label className="form-label" htmlFor="signupName">
                        Ονοματεπώνυμο
                      </label>
                      <input
                        id="signupName"
                        type="text"
                        className="form-control"
                        placeholder="Μαρία Παπαδοπούλου"
                        value={signupState.name}
                        onChange={(event) =>
                          setSignupState((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="signupEmail">
                        Email
                      </label>
                      <input
                        id="signupEmail"
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        required
                        value={signupState.email}
                        onChange={(event) =>
                          setSignupState((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="signupPassword">
                        Κωδικός πρόσβασης
                      </label>
                      <input
                        id="signupPassword"
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        required
                        minLength={8}
                        value={signupState.password}
                        onChange={(event) =>
                          setSignupState((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="termsCheck"
                        checked={signupState.acceptTerms}
                        onChange={(event) =>
                          setSignupState((prev) => ({
                            ...prev,
                            acceptTerms: event.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label" htmlFor="termsCheck">
                        Συμφωνώ με τους όρους χρήσης και την πολιτική απορρήτου.
                      </label>
                    </div>
                    <button
                      className="btn btn-primary btn-lg"
                      type="submit"
                      disabled={submitting}
                    >
                      Δημιουργία λογαριασμού
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h2 className="h4">Είσοδος</h2>
                  <p className="text-muted">
                    Συνδεθείτε με email και κωδικό για να συνεχίσετε.
                  </p>
                  <form className="d-grid gap-3" onSubmit={handleLogin}>
                    <div>
                      <label className="form-label" htmlFor="loginEmail">
                        Email
                      </label>
                      <input
                        id="loginEmail"
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        required
                        value={loginState.email}
                        onChange={(event) =>
                          setLoginState((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="loginPassword">
                        Κωδικός πρόσβασης
                      </label>
                      <input
                        id="loginPassword"
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        required
                        value={loginState.password}
                        onChange={(event) =>
                          setLoginState((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                          Να με θυμάσαι
                        </label>
                      </div>
                      <a className="small text-decoration-none" href="#">
                        Ξεχάσατε τον κωδικό;
                      </a>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-lg"
                      type="submit"
                      disabled={submitting}
                    >
                      Σύνδεση
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
