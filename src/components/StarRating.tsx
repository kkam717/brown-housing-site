interface Props {
  rating: number;
  onChange: (rating: number) => void;
}

export default function StarRating({ rating, onChange }: Props) {
  return (
    <div className="star-rating" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          className={`star-rating__star ${rating >= star ? "filled" : ""}`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          aria-checked={rating === star}
          onClick={() => onChange(star)}
        >
          &#9733;
        </button>
      ))}
      <span className="star-rating__label" aria-live="polite">
        {rating > 0 ? `${rating} / 5` : "Select a rating"}
      </span>
    </div>
  );
}
