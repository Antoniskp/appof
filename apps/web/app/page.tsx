const stats = [
  { label: 'Daily readers', value: '120K+' },
  { label: 'Verified sources', value: '250' },
  { label: 'Active polls', value: '40+' },
];

const latestStories = [
  {
    title: 'City council approves new climate initiatives',
    description:
      'A sweeping plan targets cleaner transit and neighborhood-level green projects.',
    tag: 'Civic',
  },
  {
    title: 'Tech firms rally around open AI standards',
    description:
      'Industry leaders commit to transparent governance and responsible rollout timelines.',
    tag: 'Technology',
  },
  {
    title: 'Local markets see record weekend turnout',
    description:
      'Community vendors credit new digital discovery tools for the surge in visitors.',
    tag: 'Business',
  },
];

const polls = [
  {
    question: 'Which topic should lead tonight’s newsletter?',
    options: ['Economy', 'Health', 'Education'],
  },
  {
    question: 'How often do you vote in community polls?',
    options: ['Daily', 'Weekly', 'Monthly'],
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
                Appof News & Polls
              </p>
              <h1 className="display-4 fw-bold">
                Your daily briefing, powered by community insight.
              </h1>
              <p className="lead text-secondary">
                Discover trustworthy headlines, explore context-rich reporting, and
                cast votes on the issues shaping your neighborhood.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <button className="btn btn-primary btn-lg">Explore headlines</button>
                <button className="btn btn-outline-primary btn-lg">
                  Start a poll
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
                    <h2 className="h4 mb-0">Trending now</h2>
                    <span className="badge bg-primary-subtle text-primary">
                      Live updates
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
              <h2 className="h3 mb-0">Latest coverage</h2>
              <button className="btn btn-link text-decoration-none">
                View all news
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
                        Read story
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
                <h2 className="h4">Live community polls</h2>
                <p className="text-muted">
                  Shape tomorrow’s coverage by sharing how you feel about trending
                  topics.
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
                  Vote in polls
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
              <h2 className="h3">Stay ahead with the Appof newsletter</h2>
              <p className="text-white-50 mb-0">
                Get curated headlines and poll results delivered every morning.
              </p>
            </div>
            <div className="col-lg-4">
              <form className="d-flex gap-2">
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="you@example.com"
                  aria-label="Email address"
                />
                <button className="btn btn-primary btn-lg">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
