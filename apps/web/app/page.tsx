const stats = [
  { label: 'Καθημερινοί αναγνώστες', value: '120K+' },
  { label: 'Επαληθευμένες πηγές', value: '250' },
  { label: 'Ενεργές δημοσκοπήσεις', value: '40+' },
];

const latestStories = [
  {
    title: 'Το δημοτικό συμβούλιο εγκρίνει νέες δράσεις για το κλίμα',
    description:
      'Ένα εκτεταμένο σχέδιο στοχεύει σε καθαρότερες μετακινήσεις και πράσινα έργα στις γειτονιές.',
    tag: 'Κοινωνία',
  },
  {
    title: 'Εταιρείες τεχνολογίας συσπειρώνονται γύρω από ανοιχτά πρότυπα ΤΝ',
    description:
      'Οι ηγέτες του κλάδου δεσμεύονται για διαφανή διακυβέρνηση και υπεύθυνα χρονοδιαγράμματα υλοποίησης.',
    tag: 'Τεχνολογία',
  },
  {
    title: 'Οι τοπικές αγορές σημειώνουν ρεκόρ επισκεψιμότητας το Σαββατοκύριακο',
    description:
      'Οι πωλητές αποδίδουν την αύξηση των επισκεπτών σε νέα ψηφιακά εργαλεία αναζήτησης.',
    tag: 'Οικονομία',
  },
];

const polls = [
  {
    question: 'Ποιο θέμα πρέπει να ανοίγει το αποψινό ενημερωτικό;',
    options: ['Οικονομία', 'Υγεία', 'Εκπαίδευση'],
  },
  {
    question: 'Πόσο συχνά ψηφίζετε σε δημοσκοπήσεις της κοινότητας;',
    options: ['Καθημερινά', 'Εβδομαδιαία', 'Μηνιαία'],
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="bg-white border-bottom">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <p className="text-uppercase text-primary fw-semibold mb-2">
                Appof Ειδήσεις & Δημοσκοπήσεις
              </p>
              <h1 className="display-4 fw-bold">
                Η καθημερινή σας ενημέρωση, με δύναμη από την κοινότητα.
              </h1>
              <p className="lead text-secondary">
                Ανακαλύψτε αξιόπιστους τίτλους, εξερευνήστε ρεπορτάζ με πλαίσιο και
                ψηφίστε για τα ζητήματα που διαμορφώνουν τη γειτονιά σας.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <button className="btn btn-primary btn-lg">
                  Εξερεύνηση τίτλων
                </button>
                <button className="btn btn-outline-primary btn-lg">
                  Ξεκινήστε δημοσκόπηση
                </button>
              </div>
              <div className="row text-center mt-5">
                {stats.map((stat) => (
                  <div key={stat.label} className="col-4">
                    <div className="fs-3 fw-bold text-dark">{stat.value}</div>
                    <div className="text-muted small">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0">Τώρα στις τάσεις</h2>
                    <span className="badge bg-primary-subtle text-primary">
                      Ζωντανές ενημερώσεις
                    </span>
                  </div>
                  <div className="list-group list-group-flush">
                    {latestStories.map((story) => (
                      <div
                        key={story.title}
                        className="list-group-item border-0 px-0"
                      >
                        <div className="d-flex justify-content-between">
                          <span className="fw-semibold">{story.title}</span>
                          <span className="badge bg-light text-dark border">
                            {story.tag}
                          </span>
                        </div>
                        <p className="text-muted mb-0 small">{story.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h3 mb-0">Τελευταία κάλυψη</h2>
              <button className="btn btn-link text-decoration-none">
                Όλες οι ειδήσεις
              </button>
            </div>
            <div className="row g-3">
              {latestStories.map((story) => (
                <div key={story.title} className="col-md-6">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <span className="badge bg-secondary-subtle text-secondary">
                        {story.tag}
                      </span>
                      <h3 className="h5 mt-3">{story.title}</h3>
                      <p className="text-muted">{story.description}</p>
                      <button className="btn btn-sm btn-outline-primary">
                        Διαβάστε το άρθρο
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h4">Ζωντανές δημοσκοπήσεις κοινότητας</h2>
                <p className="text-muted">
                  Διαμορφώστε την αυριανή κάλυψη μοιράζοντας τη γνώμη σας για τα
                  θέματα που βρίσκονται στις τάσεις.
                </p>
                <div className="d-grid gap-3">
                  {polls.map((poll) => (
                    <div key={poll.question} className="p-3 border rounded-3">
                      <p className="fw-semibold mb-2">{poll.question}</p>
                      <div className="d-flex flex-wrap gap-2">
                        {poll.options.map((option) => (
                          <button
                            key={option}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary w-100 mt-4">
                  Ψηφίστε στις δημοσκοπήσεις
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dark text-white">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="h3">
                Μείνετε ένα βήμα μπροστά με το newsletter του Appof
              </h2>
              <p className="text-white-50 mb-0">
                Λάβετε επιλεγμένους τίτλους και αποτελέσματα δημοσκοπήσεων κάθε
                πρωί.
              </p>
            </div>
            <div className="col-lg-4">
              <form className="d-flex gap-2">
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="you@example.com"
                  aria-label="Διεύθυνση email"
                />
                <button className="btn btn-primary btn-lg">
                  Εγγραφείτε
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
