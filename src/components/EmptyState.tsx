import { Link } from "react-router-dom";
import "./EmptyState.css";

interface Props {
  title?: string;
  message?: string;
  onReset?: () => void;
}

export default function EmptyState({
  title = "No rooms found",
  message = "Try a different keyword or reset your filters.",
  onReset,
}: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        &#128269;
      </div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__message">{message}</p>
      <div className="empty-state__actions">
        {onReset && (
          <button type="button" className="empty-state__btn" onClick={onReset}>
            Reset filters
          </button>
        )}
        <Link to="/" className="empty-state__link">
          Browse popular dorms
        </Link>
      </div>
    </div>
  );
}
