export default function TopNav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        <a className="navbar-brand fw-bold text-primary" href="#">
          <span
            className="me-2 rounded-circle bg-primary d-inline-block"
            style={{ width: 12, height: 12 }}
          />
          Appofasi
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#primaryNavbar"
          aria-controls="primaryNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="primaryNavbar">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">
                Ειδήσεις
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Δημοσκοπήσεις
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Εκπαιδευτικά άρθρα
              </a>
            </li>
          </ul>
          <ul className="navbar-nav ms-lg-auto">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Μενού χρήστη
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="#">
                    Προφίλ
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Ρυθμίσεις
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Αποσύνδεση
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
