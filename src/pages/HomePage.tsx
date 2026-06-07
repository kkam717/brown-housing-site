import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { POPULAR_BUILDINGS, QUICK_FILTERS, getPopularBuildingImage } from "../data/popularBuildings";
import { getRecentSearches } from "../services/recentSearches";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import ResponsiveImage from "../components/ResponsiveImage";
import "./HomePage.css";

const SEARCH_EXAMPLES = ["Marcy", "single north", "suite", "Olney"];

export default function HomePage() {
  useDocumentTitle("Home");

  const [query, setQuery] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const navigate = useNavigate();
  const recentSearches = getRecentSearches();

  const goToSearch = (term: string) => {
    const q = term.trim();
    navigate(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToSearch(query);
  };

  return (
    <div className="home-page">
      <section className="home-page__hero">
        <ResponsiveImage
          className="home-page__hero-image"
          src="https://i.ibb.co/ZNwkBQT/01-About.jpg"
          alt="Brown University campus in spring"
          loading="eager"
        />
        <div className="home-page__hero-content">
          <h1>Find your perfect dorm</h1>
          <p>
            Search, filter, and compare 1,600+ Brown University rooms — square footage,
            location, amenities, and student reviews.
          </p>
          <form className="home-page__search" onSubmit={handleSubmit}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setExampleIndex((i) => (i + 1) % SEARCH_EXAMPLES.length)}
              placeholder={`Try: ${SEARCH_EXAMPLES[exampleIndex]}`}
              aria-label="Search dorm listings"
            />
            <button type="submit">Search rooms</button>
          </form>
          <div className="home-page__hero-actions">
            <Link to="/listings" className="home-page__hero-link">
              Browse all listings
            </Link>
            <Link to="/map" className="home-page__hero-link home-page__hero-link--outline">
              View campus map
            </Link>
          </div>
        </div>
      </section>

      <section className="home-page__quick-filters" aria-label="Quick filters">
        {QUICK_FILTERS.map(({ label, href }) => (
          <Link key={label} to={href} className="home-page__quick-chip">
            {label}
          </Link>
        ))}
      </section>

      {recentSearches.length > 0 && (
        <section className="home-page__recent">
          <h2>Recent searches</h2>
          <div className="home-page__recent-list">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                className="home-page__recent-chip"
                onClick={() => goToSearch(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="home-page__dorms">
        <h2>Explore popular housing options</h2>
        <div className="home-page__grid">
          {POPULAR_BUILDINGS.map((dorm) => (
            <button
              key={dorm.query}
              type="button"
              className="home-page__card"
              onClick={() => goToSearch(dorm.query)}
              aria-label={`Search ${dorm.name}`}
            >
              <ResponsiveImage
                src={getPopularBuildingImage(dorm.name)}
                alt={dorm.name}
                width={280}
                height={160}
              />
              <div className="home-page__card-body">
                <h3>{dorm.name}</h3>
                <p>{dorm.address}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
