import { useState } from "react";
import { Link } from "react-router-dom";
import type { Dorm } from "../types";
import { toggleFavorite, isFavorite } from "../services/favorites";
import { getBuildingImage } from "../data/buildingImages";
import ResponsiveImage from "./ResponsiveImage";
import ReviewModal from "./ReviewModal";
import "./DormCard.css";

interface Props {
  dorm: Dorm;
  rating: number;
  reviewCount: number;
  onReviewSubmitted: () => void;
  compareSelected?: boolean;
  onCompareToggle?: () => void;
  compareDisabled?: boolean;
}

function boolLabel(value: boolean): string {
  return value ? "Yes" : "No";
}

function roomTypeLabel(npeople: number, suite: boolean): string {
  if (suite) return "Suite";
  if (npeople === 1) return "Single";
  if (npeople === 2) return "Double";
  if (npeople === 3) return "Triple";
  return `${npeople}-person`;
}

export default function DormCard({
  dorm,
  rating,
  reviewCount,
  onReviewSubmitted,
  compareSelected = false,
  onCompareToggle,
  compareDisabled = false,
}: Props) {
  const [favorited, setFavorited] = useState(isFavorite(dorm.id));
  const [copied, setCopied] = useState(false);

  const handleFavorite = () => {
    setFavorited(toggleFavorite(dorm.id));
  };

  const handleCopy = async () => {
    const text = `${dorm.building} — Room ${dorm.rnum}, ${dorm.sqft} sq ft, Floor ${dorm.floor}, ${dorm.campusside} Campus`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const mapLink = `/map?building=${encodeURIComponent(dorm.building.trim())}`;

  return (
    <article className="dorm-card">
      <ResponsiveImage
        className="dorm-card__image"
        src={getBuildingImage(dorm.building)}
        alt={`${dorm.building} room ${dorm.rnum}`}
        width={200}
        height={140}
      />
      <div className="dorm-card__details">
        <div className="dorm-card__badges">
          <span className="dorm-card__badge dorm-card__badge--type">
            {roomTypeLabel(dorm.npeople, dorm.suite)}
          </span>
          <span className="dorm-card__badge dorm-card__badge--campus">{dorm.campusside}</span>
          {!dorm.sharedbathrooms && (
            <span className="dorm-card__badge dorm-card__badge--bath">Private bath</span>
          )}
        </div>
        <h3 className="dorm-card__building">{dorm.building}</h3>
        <p className="dorm-card__address">{dorm.address}</p>
        <dl className="dorm-card__grid">
          <div>
            <dt>Room</dt>
            <dd>{dorm.rnum}</dd>
          </div>
          <div>
            <dt>Sq ft</dt>
            <dd>{dorm.sqft}</dd>
          </div>
          <div>
            <dt>Floor</dt>
            <dd>{dorm.floor}</dd>
          </div>
          <div>
            <dt>Windows</dt>
            <dd>{dorm.nwindows}</dd>
          </div>
          <div>
            <dt>Occupancy</dt>
            <dd>{dorm.npeople}</dd>
          </div>
          <div>
            <dt>Campus</dt>
            <dd>{dorm.campusside}</dd>
          </div>
          <div>
            <dt>Shared bath</dt>
            <dd>{boolLabel(dorm.sharedbathrooms)}</dd>
          </div>
          <div>
            <dt>Suite</dt>
            <dd>{boolLabel(dorm.suite)}</dd>
          </div>
        </dl>
        <div className="dorm-card__links">
          <Link to={mapLink} className="dorm-card__link">
            View on map
          </Link>
          <button type="button" className="dorm-card__link" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy summary"}
          </button>
        </div>
      </div>
      <div className="dorm-card__actions">
        <div className="dorm-card__rating">
          <span className="dorm-card__rating-value">
            {reviewCount > 0 ? rating.toFixed(1) : "—"}
          </span>
          <span className="dorm-card__rating-label">
            {reviewCount > 0 ? `${reviewCount} review${reviewCount !== 1 ? "s" : ""}` : "No reviews"}
          </span>
          {reviewCount > 0 && (
            <span className="dorm-card__stars" aria-hidden="true">
              {"★".repeat(Math.round(rating))}
              {"☆".repeat(5 - Math.round(rating))}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`dorm-card__favorite ${favorited ? "active" : ""}`}
          onClick={handleFavorite}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
        >
          {favorited ? "♥ Saved" : "♡ Save"}
        </button>
        {onCompareToggle && (
          <button
            type="button"
            className={`dorm-card__compare ${compareSelected ? "active" : ""}`}
            onClick={onCompareToggle}
            disabled={compareDisabled}
            aria-pressed={compareSelected}
          >
            {compareSelected ? "In compare" : "Compare"}
          </button>
        )}
        <ReviewModal dormId={dorm.id} onSubmitted={onReviewSubmitted} />
      </div>
    </article>
  );
}
