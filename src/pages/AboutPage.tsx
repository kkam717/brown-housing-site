import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getAllReviewStats } from "../services/reviews";
import { useReviewSync } from "../context/ReviewSyncContext";
import { isApiConfigured } from "../services/apiClient";
import ResponsiveImage from "../components/ResponsiveImage";
import "./AboutPage.css";

const TEAM = [
  { name: "Kian Kamshad", image: "https://i.ibb.co/Tk37FwX/Kian.jpg" },
  { name: "Caspar Schliemann", image: "https://i.ibb.co/SBPF7f3/Casparr.jpg" },
  { name: "Martin Pohlen", image: "https://i.ibb.co/KqzC1nF/Martinn.jpg" },
];

const SEARCH_TIPS = [
  "Marcy — search by building name",
  "single north — singles on north campus",
  "suite — suite-style rooms",
  "150 — combine with filters for min sq ft",
];

export default function AboutPage() {
  useDocumentTitle("About");

  const { cacheVersion } = useReviewSync();
  const stats = getAllReviewStats();
  const apiEnabled = isApiConfigured();

  return (
    <div className="about-page">
      <div className="about-page__panel">
        <h1>About</h1>
        <p>
          Brown Housing Lottery Demystified was built by CS0320 students to make the
          housing lottery less stressful. We centralize dorm details — room size, location,
          amenities — and student reviews in one searchable site.
        </p>
        <p>
          Search and filtering run entirely in your browser. Reviews are shared across visitors
          via a lightweight API hosted on Render, with cached data so the site stays fast even
          when the server is waking up.
        </p>

        <h2>How to use search</h2>
        <ul className="about-page__tips">
          {SEARCH_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>

        <h2>Tech stack</h2>
        <p className="about-page__stack">
          React 19 · TypeScript · Vite · React Router · Mapbox GL · Client-side JSON data ·
          {apiEnabled ? " Render API · Neon Postgres · Shared reviews" : " localStorage reviews (dev)"}
        </p>

        <h2>Reviews</h2>
        <p key={cacheVersion}>
          {apiEnabled ? (
            <>
              {stats.totalReviews} shared review{stats.totalReviews !== 1 ? "s" : ""} across{" "}
              {stats.dormCount} room{stats.dormCount !== 1 ? "s" : ""} (cached locally for fast
              loading).
            </>
          ) : (
            <>
              {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""} cached in this
              browser across {stats.dormCount} room{stats.dormCount !== 1 ? "s" : ""}. Set{" "}
              <code>VITE_API_URL</code> to connect to the shared review server.
            </>
          )}
        </p>

        <h2>The Team</h2>
        <div className="about-page__team">
          {TEAM.map((member) => (
            <figure key={member.name} className="about-page__member">
              <ResponsiveImage src={member.image} alt={member.name} width={120} height={120} />
              <figcaption>{member.name}</figcaption>
            </figure>
          ))}
        </div>

        <h2>Acknowledgments</h2>
        <p>
          Special thanks to Professor Tim Nelson and the course TAs for supporting this project.
        </p>
      </div>
    </div>
  );
}
