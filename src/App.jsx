import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";

const API_URL = "https://api.tvmaze.com";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🎬</span>
          <span>Movie<span className="accent">Explorer</span></span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
            Home
          </NavLink>
          <NavLink to="/movies" className={({ isActive }) => isActive ? "active" : ""}>
            Movies
          </NavLink>
        </nav>

        <Link to="/movies" className="nav-cta">
          Explore Movies
        </Link>
      </div>
    </header>
  );
}

function Home() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/shows?page=0`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load featured shows");
        return res.json();
      })
      .then((shows) => {
        const withImage = shows.find((show) => show.image?.original);
        setFeatured(withImage ?? shows[0] ?? null);
      })
      .catch(() => setFeatured(null));
  }, []);

  const heroImage = featured?.image?.original || featured?.image?.medium;

  return (
    <>
      <section
        className="hero"
        style={heroImage ? { "--hero-image": `url("${heroImage}")` } : undefined}
      >
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="eyebrow">YOUR NEXT FAVORITE SHOW IS HERE</span>
          <h1>Discover Stories Worth Watching.</h1>
          <p>
            Explore popular shows, search for your favorite titles, and discover
            something new every time you visit.
          </p>
          <Link to="/movies" className="primary-btn">
            Explore Now <span>→</span>
          </Link>
        </div>
      </section>

      <section className="container intro-section">
        <div>
          <span className="section-label">MOVIE EXPLORER</span>
          <h2>Find something you’ll love.</h2>
        </div>
        <p>
          Browse a huge collection of TV shows, search by title, and open any
          card to see more details including ratings, genres, language, and
          release information.
        </p>
      </section>

      <section className="container feature-grid">
        <FeatureCard icon="🔎" title="Search Easily" text="Find shows quickly by typing a title in the search bar." />
        <FeatureCard icon="⭐" title="Check Ratings" text="See audience ratings and important show information at a glance." />
        <FeatureCard icon="🎞️" title="Explore Details" text="Open the details modal for a closer look at each title." />
      </section>
    </>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Movies() {
  const [shows, setShows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    const endpoint = query.trim()
      ? `${API_URL}/search/shows?q=${encodeURIComponent(query.trim())}`
      : `${API_URL}/shows?page=0`;

    fetch(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to fetch shows.");
        return res.json();
      })
      .then((data) => {
        const normalized = query.trim()
          ? data.map((item) => item.show)
          : data;

        setShows(normalized);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Something went wrong while loading shows.");
          setShows([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  return (
    <section className="container movies-page">
      <div className="page-heading">
        <div>
          <span className="section-label">EXPLORE</span>
          <h1>Browse Movies & Shows</h1>
          <p>Search for a title or browse the available shows below.</p>
        </div>
      </div>

      <div className="search-box">
        <span className="search-icon">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a movie or show..."
          aria-label="Search for a movie or show"
        />
        {query && (
          <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      {query.trim() && !loading && (
        <p className="result-count">
          Search results for <strong>“{query.trim()}”</strong>: {shows.length}
        </p>
      )}

      {loading && <LoadingGrid />}
      {!loading && error && <ErrorState message={error} onRetry={() => setQuery((q) => q)} />}
      {!loading && !error && shows.length === 0 && <EmptyState query={query} />}

      {!loading && !error && shows.length > 0 && (
        <div className="movie-grid">
          {shows.map((show) => (
            <MovieCard key={show.id} show={show} onDetails={() => setSelectedShow(show)} />
          ))}
        </div>
      )}

      {selectedShow && (
        <MovieModal show={selectedShow} onClose={() => setSelectedShow(null)} />
      )}
    </section>
  );
}

function MovieCard({ show, onDetails }) {
  const poster = show.image?.medium || show.image?.original;
  const year = getYear(show.premiered);
  const rating = show.rating?.average;

  return (
    <article className="movie-card">
      <div className="poster-wrap">
        {poster ? (
          <img src={poster} alt={`${show.name} poster`} className="poster" loading="lazy" />
        ) : (
          <div className="poster-placeholder">🎬</div>
        )}
        {rating && <span className="rating-badge">★ {rating}</span>}
      </div>

      <div className="card-body">
        <h2 title={show.name}>{show.name}</h2>
        <div className="meta">
          <span>⭐ {rating ?? "N/A"}</span>
          <span>•</span>
          <span>📅 {year ?? "N/A"}</span>
        </div>
        <p className="card-genre">
          {show.genres?.slice(0, 2).join(" • ") || "Drama"}
        </p>
        <button className="details-btn" onClick={onDetails}>
          See Details
        </button>
      </div>
    </article>
  );
}

function MovieModal({ show, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("modal-open");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  const image = show.image?.original || show.image?.medium;
  const summary = stripHtml(show.summary) || "No summary is available for this show.";

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close" onClick={onClose} aria-label="Close details">
          ×
        </button>

        <div className="modal-image-wrap">
          {image ? (
            <img src={image} alt={`${show.name} backdrop`} />
          ) : (
            <div className="modal-image-placeholder">🎬</div>
          )}
          <div className="modal-image-gradient" />
        </div>

        <div className="modal-content">
          <span className="section-label">SHOW DETAILS</span>
          <h2 id="modal-title">{show.name}</h2>

          <div className="modal-meta">
            <span>⭐ {show.rating?.average ?? "N/A"}</span>
            <span>📅 {getYear(show.premiered) ?? "N/A"}</span>
            <span>🌐 {show.language ?? "N/A"}</span>
            <span>⏱ {show.runtime ? `${show.runtime} min` : "N/A"}</span>
          </div>

          <div className="genre-list">
            {show.genres?.map((genre) => <span key={genre}>{genre}</span>)}
          </div>

          <h3>Overview</h3>
          <p className="summary">{summary}</p>

          <div className="modal-extra">
            <div>
              <span>Network</span>
              <strong>{show.network?.name || show.webChannel?.name || "N/A"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{show.status || "N/A"}</strong>
            </div>
            <div>
              <span>Country</span>
              <strong>{show.network?.country?.name || "N/A"}</strong>
            </div>
          </div>

          <button className="primary-btn modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="movie-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton poster-skeleton" />
          <div className="skeleton skeleton-line large" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-button" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="empty-state">
      <div>🍿</div>
      <h2>No shows found</h2>
      <p>
        {query
          ? `We couldn't find any results for "${query}". Try another title.`
          : "There are no shows to display right now."}
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="empty-state error-state">
      <div>⚠️</div>
      <h2>Oops!</h2>
      <p>{message}</p>
      <button className="details-btn" onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="container not-found">
      <span>404</span>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button className="primary-btn" onClick={() => navigate("/")}>Back Home</button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🎬</span>
          <span>Movie<span className="accent">Explorer</span></span>
        </Link>
        <p>© {new Date().getFullYear()} MovieExplorer. Built with React & TVMaze.</p>
        <a href="https://www.tvmaze.com/api" target="_blank" rel="noreferrer">
          TVMaze API
        </a>
      </div>
    </footer>
  );
}

function getYear(date) {
  return date ? new Date(date).getFullYear() : null;
}

function stripHtml(value = "") {
  const temp = document.createElement("div");
  temp.innerHTML = value;
  return temp.textContent || temp.innerText || "";
}

export default App;
