function ImagesTab({ sub, subtopicId, toast, onUpdate }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const getBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
  
  // Function to get image URL from imagePath
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Extract filename from path (e.g., "/uploads/images/page_123.png" -> "page_123.png")
    const filename = imagePath.split('/').pop();
    return `${getBaseUrl()}/admin/images/${filename}`;
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/subtopic-images/subtopic/${subtopicId}`);
      console.log('Loaded images for subtopic:', data);
      setImages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load images:', e);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subtopicId) loadImages();
  }, [subtopicId]);

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/admin/subtopic-images/${imageId}`);
      setImages(images.filter(img => img.id !== imageId));
      toast.show('Image deleted');
    } catch (e) {
      toast.show('Failed to delete image', 'error');
    }
  };

  const handleImageError = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  if (loading) {
    return (
      <div style={{ padding: 22, textAlign: 'center', color: clr.muted }}>
        Loading images...
      </div>
    );
  }

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Lbl>Subtopic Images ({images.length})</Lbl>
          <Btn size="sm" onClick={loadImages} disabled={loading} variant="ghost">
            {loading ? 'Loading…' : '🔄 Refresh'}
          </Btn>
        </div>
        {images.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: clr.faint, borderRadius: 10, color: clr.muted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
            <div style={{ fontSize: 13 }}>No images extracted for this subtopic yet.</div>
            <div style={{ fontSize: 12, color: clr.muted, marginTop: 4 }}>Upload a PDF with images to automatically extract them.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {images.map((img) => {
              const imageUrl = getImageUrl(img.imagePath);
              return (
                <div key={img.id} style={{ 
                  position: 'relative', 
                  borderRadius: 10, 
                  overflow: 'hidden', 
                  border: `1px solid ${clr.border}`, 
                  background: clr.faint,
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }} onClick={() => imageUrl && window.open(imageUrl, '_blank')}>
                  {imageUrl && !imageErrors[img.id] ? (
                    <img
                      src={imageUrl}
                      alt={`Page ${img.pageNumber || 'image'}`}
                      style={{ width: '100%', height: 160, objectFit: 'cover' }}
                      onError={() => handleImageError(img.id)}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: 160, 
 display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: clr.faint,
                      color: clr.muted
                    }}>
                      <span>🖼️ Image not available</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      deleteImage(img.id); 
                    }}
                    style={{
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      background: clr.danger, 
                      color: '#fff',
                      border: 'none', 
                      borderRadius: 20, 
                      width: 28, 
                      height: 28, 
                      display: 'flex',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      fontSize: 14, 
                      opacity: 0.9,
                      transition: 'opacity 0.2s'
                    }}
                    title="Delete image"
                  >
                    ×
                  </button>
                  <div style={{ padding: '8px 12px', fontSize: 11, color: clr.muted, background: clr.white, borderTop: `1px solid ${clr.border}` }}>
                    {img.pageNumber ? `Page ${img.pageNumber}` : 'Extracted Image'}
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