import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  useDocumentTitle("Page Not Found");

  return (
    <div className="not-found">
      <div className="not-found__panel">
        <h1>404</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="not-found__link">
          Back to home
        </Link>
      </div>
    </div>
  );
}
