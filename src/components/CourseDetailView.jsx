    import React, { useState } from 'react';

    function CourseDetailView({
    selectedCourse,
    topics,           // array of topic objects, each containing `subtopics` array
    subtopics,        // flattened list of all subtopics (for progress indexing)
    images,
    progress,
    activeView,
    activeSection,
    completedSections,
    currentSubtopic,
    contentLoading,
    handleBack,
    setActiveView,
    setActiveSection,
    setCurrentSubtopic,
    loadSubtopicImages,
    resetProgress,
    markSectionComplete,
    getImageSrc,
    getImageUrl,
    handleImageError,
    styles,
    }) {
    const [expandedTopics, setExpandedTopics] = useState({});
    const isMobile = window.innerWidth < 768;

    const toggleTopic = (topicId) => {
        setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    if (contentLoading) {
        return (
        <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading course content...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        );
    }

    const currentSub = subtopics[activeSection];
    const isCompleted = completedSections.includes(activeSection);
    const subtopicImages = images.filter(img => img.subTopicId === currentSub?.id);

    // Enhanced detail styles (overrides and additions)
    const detailStyles = {
        ...styles,
        courseDetailContainer: { ...styles.courseDetailContainer, maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '20px' : '40px' },
        backToCourses: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', padding: '8px 20px', borderRadius: '40px', fontWeight: '500', transition: 'all 0.2s', '&:hover': { background: '#e2e8f0' } },
        courseHero: { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', padding: isMobile ? '30px' : '40px', borderRadius: '32px', marginBottom: '30px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' },
        courseHeroTitle: { fontSize: isMobile ? '28px' : '36px', fontWeight: '800', marginBottom: '15px' },
        courseHeroStats: { display: 'flex', justifyContent: 'center', gap: isMobile ? '20px' : '40px', margin: '20px 0', fontSize: isMobile ? '13px' : '15px', opacity: 0.9, flexWrap: 'wrap', background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '60px', display: 'inline-flex', width: 'auto', margin: '0 auto 20px' },
        progressBarLarge: { background: 'rgba(255,255,255,0.2)', borderRadius: '20px', height: '10px', overflow: 'hidden', maxWidth: '400px', margin: '20px auto 0' },
        progressFillLarge: { background: '#a5b4fc', height: '100%', borderRadius: '20px' },
        progressTextLarge: { display: 'block', marginTop: '10px', fontSize: '14px', fontWeight: '500' },
        viewControls: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' },
        splitView: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', gap: '30px' },
        tocPanel: { background: 'white', borderRadius: '24px', padding: '20px', position: isMobile ? 'relative' : 'sticky', top: '20px', height: isMobile ? 'auto' : 'calc(100vh - 100px)', overflowY: 'auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
        tocTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e293b', borderBottom: '3px solid #6366f1', paddingBottom: '12px', display: 'inline-block' },
        tocList: { listStyle: 'none', padding: 0, margin: 0 },
        topicHeader: { display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 16px', background: '#f8fafc', borderRadius: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', transition: 'background 0.2s', '&:hover': { background: '#f1f5f9' } },
        subtopicItem: (isActive, isCompleted) => ({
        padding: '10px 16px 10px 28px',
        cursor: 'pointer',
        borderRadius: '12px',
        fontSize: '14px',
        marginBottom: '6px',
        marginLeft: '12px',
        borderLeft: `3px solid ${isActive ? '#6366f1' : (isCompleted ? '#10b981' : '#e2e8f0')}`,
        background: isActive ? '#eef2ff' : (isCompleted ? '#f0fdf4' : 'transparent'),
        color: isActive ? '#4f46e5' : (isCompleted ? '#059669' : '#475569'),
        fontWeight: isActive ? '500' : 'normal',
        transition: 'all 0.2s',
        '&:hover': { background: '#f1f5f9', transform: 'translateX(4px)' }
        }),
        contentPanel: { background: 'white', borderRadius: '24px', padding: isMobile ? '24px' : '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxHeight: isMobile ? 'auto' : 'calc(100vh - 100px)', overflowY: 'auto' },
        currentSectionHeader: { marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
        currentSectionTitle: { fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: '#0f172a' },
        completeBtn: { background: '#22c55e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '40px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', marginTop: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', '&:hover': { background: '#16a34a', transform: 'scale(1.02)' } },
        resetBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '40px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background 0.2s', '&:hover': { background: '#dc2626' } },
        galleryContainer: { background: 'white', borderRadius: '24px', padding: isMobile ? '24px' : '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
        galleryTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' },
        imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' },
        imageCard: { border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' } },
        image: { width: '100%', height: '160px', objectFit: 'cover' },
        imageInfo: { padding: '10px', fontSize: '12px', textAlign: 'center', background: '#f8fafc', color: '#64748b' },
        emptySection: { textAlign: 'center', padding: '60px', color: '#94a3b8' },
        sectionBadge: { fontSize: '12px', marginLeft: '8px', color: '#10b981' },
        paragraphText: { lineHeight: '1.8', marginBottom: '16px', color: '#334155', fontSize: '15px' },
        controlBtn: (active) => ({ padding: '10px 24px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', background: active ? '#6366f1' : '#ffffff', color: active ? 'white' : '#4b5563', boxShadow: active ? '0 2px 8px rgba(99,102,241,0.3)' : '0 1px 2px rgba(0,0,0,0.05)' }),
        sectionProgress: { fontSize: '12px', color: '#059669', background: '#d1fae5', padding: '4px 12px', borderRadius: '20px' },
    };

    return (
        <div style={detailStyles.container}>
        <div style={detailStyles.courseDetailContainer}>
            <button style={detailStyles.backToCourses} onClick={handleBack}>← Back to Courses</button>

            <div style={detailStyles.courseHero}>
            <h1 style={detailStyles.courseHeroTitle}>{selectedCourse.title}</h1>
            <div style={detailStyles.courseHeroStats}>
                <span>📚 {topics.length} topics</span>
                <span>📑 {subtopics.length} sections</span>
                <span>🖼️ {images.length} images</span>
            </div>
            <div style={detailStyles.progressBarLarge}>
                <div style={{ ...detailStyles.progressFillLarge, width: `${progress}%` }}></div>
            </div>
            <span style={detailStyles.progressTextLarge}>{Math.round(progress)}% Complete</span>
            </div>

            <div style={detailStyles.viewControls}>
            <button style={detailStyles.controlBtn(activeView === 'split')} onClick={() => setActiveView('split')}>
                📚 Course View
            </button>
            <button style={detailStyles.controlBtn(activeView === 'gallery')} onClick={() => setActiveView('gallery')}>
                🖼️ Image Gallery ({images.length})
            </button>
            <button style={detailStyles.resetBtn} onClick={resetProgress}>⟳ Reset Progress</button>
            </div>

            {activeView === 'split' && (
            <div style={detailStyles.splitView}>
                <div style={detailStyles.tocPanel}>
                <h3 style={detailStyles.tocTitle}>📑 Course Content</h3>
                <ul style={detailStyles.tocList}>
                    {/* Use the nested topics directly */}
                    {topics.map(topic => {
                    const topicSubs = topic.subtopics || []; // ✅ backend returns 'subtopics' (lowercase)
                    const isExpanded = expandedTopics[topic.id];
                    return (
                        <li key={topic.id} style={{ marginBottom: '8px' }}>
                        <div style={detailStyles.topicHeader} onClick={() => toggleTopic(topic.id)}>
                            <span style={{ marginRight: '10px', fontSize: '14px' }}>{isExpanded ? '▼' : '▶'}</span>
                            <span>{topic.title}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '12px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '20px' }}>{topicSubs.length}</span>
                        </div>
                        {isExpanded && (
                            <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '4px' }}>
                            {topicSubs.map(sub => {
                                // Find index in flattened subtopics array
                                const globalIndex = subtopics.findIndex(s => s.id === sub.id);
                                const isActive = activeSection === globalIndex;
                                const isSecCompleted = completedSections.includes(globalIndex);
                                return (
                                <li
                                    key={sub.id}
                                    style={detailStyles.subtopicItem(isActive, isSecCompleted)}
                                    onClick={async () => {
                                    setActiveSection(globalIndex);
                                    setCurrentSubtopic(sub);
                                    await loadSubtopicImages(sub.id);
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{sub.title}</span>
                                    {isSecCompleted && <span style={detailStyles.sectionBadge}>✓</span>}
                                    </div>
                                </li>
                                );
                            })}
                            </ul>
                        )}
                        </li>
                    );
                    })}
                </ul>
                </div>

                <div style={detailStyles.contentPanel}>
                {currentSub ? (
                    <>
                    <div style={detailStyles.currentSectionHeader}>
                        <h2 style={detailStyles.currentSectionTitle}>{currentSub.title}</h2>
                        {isCompleted && <span style={detailStyles.sectionProgress}>✅ Completed</span>}
                    </div>

                    {subtopicImages.map(img => (
                        <div key={img.id} style={{ margin: '20px 0', textAlign: 'center' }}>
                        <img
                            src={getImageSrc(currentSub.id, img.fileName, img.id)}
                            alt={`Diagram: ${img.fileName}`}
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                            onError={() => handleImageError(img.id)}
                            onClick={() => window.open(getImageUrl(currentSub.id, img.fileName), '_blank')}
                        />
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Page {img.pageNumber} • {img.width}x{img.height}</div>
                        </div>
                    ))}

                    <div>
                        {currentSub.content?.split('\n').map((para, idx) => (
                        <p key={idx} style={detailStyles.paragraphText}>{para}</p>
                        ))}
                    </div>

                    {currentSub.videoUrl && (
                        <div style={{ margin: '20px 0' }}>
                        <iframe width="100%" height="400" src={currentSub.videoUrl.replace('watch?v=', 'embed/')} title="Video" frameBorder="0" allowFullScreen style={{ borderRadius: '20px' }}></iframe>
                        </div>
                    )}

                    <button style={detailStyles.completeBtn} onClick={() => markSectionComplete(activeSection)} disabled={isCompleted}>
                        {isCompleted ? '✓ Section Completed' : '✓ Mark Section Complete'}
                    </button>
                    </>
                ) : (
                    <div style={detailStyles.emptySection}>Select a section to view its content</div>
                )}
                </div>
            </div>
            )}

            {activeView === 'gallery' && (
            <div style={detailStyles.galleryContainer}>
                <h2 style={detailStyles.galleryTitle}>📸 Course Images ({images.length})</h2>
                {images.length === 0 ? <p>No images yet</p> : (
                <div style={detailStyles.imageGrid}>
                    {images.map(img => (
                    <div key={img.id} style={detailStyles.imageCard} onClick={() => window.open(getImageUrl(img.subTopicId, img.fileName), '_blank')}>
                        <img src={getImageSrc(img.subTopicId, img.fileName, img.id)} alt={`Page ${img.pageNumber}`} style={detailStyles.image} onError={() => handleImageError(img.id)} />
                        <div style={detailStyles.imageInfo}>Page {img.pageNumber} • {img.width}x{img.height}</div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            )}
        </div>
        </div>
    );
    }

    export default CourseDetailView;