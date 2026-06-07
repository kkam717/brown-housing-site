import type { Dorm } from "../types";
import "./CompareModal.css";

interface Props {
  dorms: Dorm[];
  onClose: () => void;
  onRemove: (id: number) => void;
}

export default function CompareModal({ dorms, onClose, onRemove }: Props) {
  if (dorms.length === 0) return null;

  return (
    <div className="compare-modal__overlay" onClick={onClose}>
      <div
        className="compare-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="compare-modal__header">
          <h2 id="compare-title">Compare rooms ({dorms.length}/3)</h2>
          <button type="button" className="compare-modal__close" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="compare-modal__grid">
          {dorms.map((dorm) => (
            <div key={dorm.id} className="compare-modal__col">
              <button
                type="button"
                className="compare-modal__remove"
                onClick={() => onRemove(dorm.id)}
                aria-label={`Remove ${dorm.building} room ${dorm.rnum}`}
              >
                Remove
              </button>
              <h3>{dorm.building}</h3>
              <p className="compare-modal__room">Room {dorm.rnum}</p>
              <dl>
                <div>
                  <dt>Sq ft</dt>
                  <dd>{dorm.sqft}</dd>
                </div>
                <div>
                  <dt>Floor</dt>
                  <dd>{dorm.floor}</dd>
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
                  <dd>{dorm.sharedbathrooms ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>Suite</dt>
                  <dd>{dorm.suite ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
