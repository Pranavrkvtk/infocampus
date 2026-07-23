// src/components/Admin/HomeImagesTab.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  getHomeImages,
  uploadHomeImage,
  deleteHomeImage,
} from '../../api/adminApi';
import { LoadingSpinner } from './AdminStyles';

// ─── Material UI Icons ──────────────────────────────────────────────
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import RefreshIcon from '@mui/icons-material/Refresh';

// ─── Helper: Get API URL ──────────────────────────────────────────────
const getApiUrl = () => {
  return process.env.REACT_APP_API_URL || "http://localhost:8082/api";
};

// ─── Helper: Resolve Image URL ──────────────────────────────────────
const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  if (
    imageUrl.startsWith("data:image/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  const API_URL = getApiUrl();
  const BASE_URL = API_URL.replace(/\/api\/?$/, '');
  let normalizedPath = imageUrl;

  if (normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.substring(4);
  }
  if (normalizedPath.startsWith('api/')) {
    normalizedPath = normalizedPath.substring(4);
  }
  
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }

  if (!normalizedPath.includes('/')) {
    normalizedPath = `uploads/${normalizedPath}`;
  }

  return `${BASE_URL}/${normalizedPath}`;
};

function HomeImagesTab() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ─── Load Images ──────────────────────────────────────────────────
  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await getHomeImages();
      console.log('📸 Home images loaded:', data);
      setImages(Array.isArray(data) ? data : data.images || []);
    } catch (error) {
      console.error('❌ Error loading home images:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Images',
        text: error.message || 'Could not load home images.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle File Selection ──────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please select an image file (JPEG, PNG, etc.)',
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Upload Image ────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select an image file first.',
      });
      return;
    }

    try {
      setUploading(true);
      const result = await uploadHomeImage(selectedFile);
      console.log('✅ Image uploaded:', result);
      
      Swal.fire({
        icon: 'success',
        title: 'Upload Successful!',
        text: 'Home image has been uploaded.',
        timer: 1500,
        showConfirmButton: false,
      });
      
      // Reset file input
      setSelectedFile(null);
      setImagePreview(null);
      document.getElementById('image-upload-input').value = '';
      
      // Reload images
      await loadImages();
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.message || 'Could not upload image.',
      });
    } finally {
      setUploading(false);
    }
  };

  // ─── Delete Image ────────────────────────────────────────────────
  const handleDelete = async (imageId) => {
    const result = await Swal.fire({
      title: 'Delete Image?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete',
    });

    if (result.isConfirmed) {
      try {
        await deleteHomeImage(imageId);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Image has been removed.',
          timer: 1500,
          showConfirmButton: false,
        });
        await loadImages();
      } catch (error) {
        console.error('❌ Error deleting image:', error);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.message || 'Could not delete image.',
        });
      }
    }
  };

  // ─── Load on mount ──────────────────────────────────────────────
  useEffect(() => {
    loadImages();
  }, []);

  // ─── Render ──────────────────────────────────────────────────────
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.container}>
      {/* Upload Section */}
      <div style={styles.uploadSection}>
        <h3 style={styles.sectionTitle}>
          <AddPhotoAlternateIcon style={{ fontSize: '20px' }} />
          Upload Home Image
        </h3>
        <p style={styles.sectionSubtitle}>
          Upload images that will appear in the homepage hero slider
        </p>

        <div style={styles.uploadArea}>
          <div style={styles.uploadRow}>
            <input
              id="image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={styles.fileInput}
            />
            <label htmlFor="image-upload-input" style={styles.fileInputLabel}>
              <AddPhotoAlternateIcon style={{ fontSize: '20px' }} />
              Choose Image
            </label>
            {selectedFile && (
              <span style={styles.fileName}>{selectedFile.name}</span>
            )}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{
                ...styles.uploadBtn,
                opacity: !selectedFile || uploading ? 0.6 : 1,
                cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer',
              }}
            >
              <CloudUploadIcon style={{ fontSize: '18px' }} />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={loadImages}
              style={styles.refreshBtn}
              title="Refresh images"
            >
              <RefreshIcon style={{ fontSize: '18px' }} />
            </button>
          </div>

          {imagePreview && (
            <div style={styles.previewContainer}>
              <img src={imagePreview} alt="Preview" style={styles.previewImage} />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                  document.getElementById('image-upload-input').value = '';
                }}
                style={styles.clearPreviewBtn}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Images Grid */}
      <div style={styles.imagesSection}>
        <div style={styles.imagesHeader}>
          <h3 style={styles.sectionTitle}>
            <ImageIcon style={{ fontSize: '20px' }} />
            Home Images ({images.length})
          </h3>
        </div>

        {images.length === 0 ? (
          <div style={styles.emptyState}>
            <ImageIcon style={{ fontSize: '64px', color: '#cbd5e1' }} />
            <p style={styles.emptyText}>No home images uploaded yet</p>
            <span style={styles.emptyHint}>Upload an image to display on the homepage</span>
          </div>
        ) : (
          <div style={styles.grid}>
            {images.map((image) => {
              const imageUrl = resolveImageUrl(image.imageUrl);
              return (
                <div key={image.id} style={styles.card}>
                  <div style={styles.cardImageWrapper}>
                    <img
                      src={imageUrl}
                      alt={`Home image ${image.id}`}
                      style={styles.cardImage}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <div style={styles.cardInfo}>
                    <span style={styles.cardId}>ID: {image.id}</span>
                    <button
                      onClick={() => handleDelete(image.id)}
                      style={styles.deleteBtn}
                    >
                      <DeleteIcon style={{ fontSize: '16px' }} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  uploadSection: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e4e7ec',
    marginBottom: '24px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#0f172a',
    marginTop: 0,
    marginBottom: '4px',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '16px',
  },
  uploadArea: {
    border: '2px dashed #e4e7ec',
    borderRadius: '8px',
    padding: '20px',
    background: '#fafbfc',
  },
  uploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  fileInput: {
    display: 'none',
  },
  fileInputLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  fileName: {
    fontSize: '13px',
    color: '#0f172a',
    background: '#f1f5f9',
    padding: '6px 12px',
    borderRadius: '6px',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: '#22c55e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  previewContainer: {
    position: 'relative',
    marginTop: '16px',
    display: 'inline-block',
  },
  previewImage: {
    maxWidth: '200px',
    maxHeight: '150px',
    borderRadius: '8px',
    border: '1px solid #e4e7ec',
    objectFit: 'cover',
  },
  clearPreviewBtn: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#ef4444',
    color: '#ffffff',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagesSection: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e4e7ec',
  },
  imagesHeader: {
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e4e7ec',
    overflow: 'hidden',
    transition: 'all 0.2s',
  },
  cardImageWrapper: {
    width: '100%',
    paddingBottom: '66.67%',
    position: 'relative',
    background: '#f1f5f9',
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#ffffff',
  },
  cardId: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  deleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    background: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#94a3b8',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: 500,
    marginTop: '12px',
    color: '#64748b',
  },
  emptyHint: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '4px',
  },
};

export default HomeImagesTab;