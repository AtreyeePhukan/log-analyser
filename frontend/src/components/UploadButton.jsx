import React, { useRef } from "react";

export default function UploadButton({ onFileSelected }) {
  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="top-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        onClick={handleClick}
        className="btn-primary"
      >
        Upload Logs
      </button>
    </div>
  );
}

