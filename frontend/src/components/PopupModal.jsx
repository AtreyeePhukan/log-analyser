import React from "react";
import "../index.css";

const PopupModal = ({ open, onClose, analysis }) => {
  if (!open || !analysis) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button onClick={onClose} className="popup-close">✖</button>

        <h2 className="popup-title">Log Analysis</h2>

        <div className="popup-section">
          <p className="popup-label">Log:</p>
          <p className="popup-text">{analysis.log}</p>
        </div>

        <div className="popup-section">
          <p className="popup-label">Explanation:</p>
          <p className="popup-text">{analysis.explanation}</p>
        </div>

        <div className="popup-section">
          <p className="popup-label">Recommended Action:</p>
          <p className="popup-action">{analysis.action}</p>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
