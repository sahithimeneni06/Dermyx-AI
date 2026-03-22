import React, { useRef, useState } from 'react';
import './ImageAnalysis.css';

const DropZone = ({ file, onFileSelect, onClear }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    if (!file) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      onFileSelect(selectedFile);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      onFileSelect(droppedFile);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div 
        className={`drop-zone ${file ? 'has-file' : ''} ${isDragOver ? 'drag-over' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <>
            <img 
              src={URL.createObjectURL(file)} 
              className="drop-preview" 
              alt="Preview" 
            />
            <button className="drop-clear" onClick={handleClear}>
              ✕ Remove
            </button>
          </>
        ) : (
          <div className="drop-inner">
            <div className="drop-icon">⬆</div>
            <p className="drop-main">Drag & drop a skin image here</p>
            <p style={{fontSize:'.84rem',color:'var(--ink2)',marginTop:'2px'}}>
              or click to browse
            </p>
            <p className="drop-hint">JPG · PNG · WEBP supported</p>
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        style={{display:'none'}} 
        onChange={handleFileChange}
      />
    </>
  );
};

export default DropZone;