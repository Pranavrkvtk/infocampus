// src/components/Admin/CourseEnrollmentEditorTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  getEnrollmentConfigById, 
  updateEnrollmentConfig, 
  createEnrollmentConfig,
  getDefaultEnrollmentConfig,
  deleteEnrollmentConfig
} from '../../api/enrollmentConfigApi';
import Swal from 'sweetalert2';

export default function CourseEnrollmentEditorTab({ courseId, onSave }) {
  const [config, setConfig] = useState({
    courseId: courseId || null,
    joinButtonText: 'Join This Course',
    shareButtonText: 'Share',
    primaryColor: '#3abf94',
    secondaryColor: '#1a1a2e',
    descriptionTitle: 'About This Course',
    lessonsTitle: 'Course Content',
    showRating: true,
    showMembers: true,
    showLastUpdate: true,
    customCss: '',
    layoutStyle: 'default'
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configExists, setConfigExists] = useState(false);

  // ✅ Wrap loadConfig in useCallback to stabilize it
  const loadConfig = useCallback(async () => {
    if (!courseId) {
      console.warn('No courseId provided');
      return;
    }
    
    setLoading(true);
    try {
      console.log('📥 Loading config for course:', courseId);
      const data = await getEnrollmentConfigById(courseId);
      console.log('✅ Config loaded:', data);
      setConfig(data);
      setConfigExists(true);
    } catch (error) {
      console.error('Error loading config:', error);
      if (error.response?.status === 404) {
        // Config doesn't exist, load defaults
        try {
          console.log('📥 Loading default config for course:', courseId);
          const defaultConfig = await getDefaultEnrollmentConfig(courseId);
          console.log('✅ Default config loaded:', defaultConfig);
          setConfig(defaultConfig);
          setConfigExists(false);
        } catch (defaultError) {
          console.error('Error loading default config:', defaultError);
          // Use local defaults
          setConfig(prev => ({
            ...prev,
            courseId: courseId
          }));
          setConfigExists(false);
        }
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to load configuration: ' + (error.response?.data?.error || error.message),
          icon: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]); // ✅ Add courseId as dependency

  // ✅ Now include loadConfig in the dependency array
  useEffect(() => {
    if (courseId) {
      loadConfig();
    }
  }, [courseId, loadConfig]); // ✅ Added loadConfig to dependencies

  const handleSave = async () => {
    if (!courseId) {
      Swal.fire({
        title: 'Error',
        text: 'Please select a course first',
        icon: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      const configToSave = {
        ...config,
        courseId: courseId
      };
      
      console.log('💾 Saving config:', configToSave);
      
      let saved;
      try {
        // Try to update first
        saved = await updateEnrollmentConfig(courseId, configToSave);
        console.log('✅ Config updated:', saved);
        setConfigExists(true);
      } catch (error) {
        if (error.response?.status === 404) {
          // If not found, create new
          console.log('📝 Config not found, creating new...');
          saved = await createEnrollmentConfig(configToSave);
          console.log('✅ Config created:', saved);
          setConfigExists(true);
        } else {
          throw error;
        }
      }
      
      Swal.fire({
        title: 'Success!',
        text: 'Configuration saved successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      if (onSave) onSave(saved);
    } catch (error) {
      console.error('Error saving config:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save configuration: ' + (error.response?.data?.error || error.message),
        icon: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!configExists) {
      Swal.fire({
        title: 'Info',
        text: 'No configuration to delete',
        icon: 'info'
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: 'Delete Configuration?',
      text: 'Are you sure you want to delete this configuration?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626'
    });

    if (!confirmed.isConfirmed) return;

    try {
      await deleteEnrollmentConfig(courseId);
      setConfigExists(false);
      
      // Reset to defaults
      const defaultConfig = await getDefaultEnrollmentConfig(courseId);
      setConfig(defaultConfig);
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Configuration deleted successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting config:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete configuration: ' + (error.response?.data?.error || error.message),
        icon: 'error'
      });
    }
  };

  const handleReset = async () => {
    const confirmed = await Swal.fire({
      title: 'Reset to Defaults?',
      text: 'This will reset all fields to default values. Your saved configuration will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reset',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f59e0b'
    });

    if (!confirmed.isConfirmed) return;

    try {
      const defaultConfig = await getDefaultEnrollmentConfig(courseId);
      setConfig(defaultConfig);
      setConfigExists(false);
      
      Swal.fire({
        title: 'Reset!',
        text: 'Configuration reset to defaults',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error resetting config:', error);
      // Reset to local defaults
      setConfig({
        courseId: courseId,
        joinButtonText: 'Join This Course',
        shareButtonText: 'Share',
        primaryColor: '#3abf94',
        secondaryColor: '#1a1a2e',
        descriptionTitle: 'About This Course',
        lessonsTitle: 'Course Content',
        showRating: true,
        showMembers: true,
        showLastUpdate: true,
        customCss: '',
        layoutStyle: 'default'
      });
      setConfigExists(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading configuration...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Enrollment Page Editor</h2>
          <p style={{ color: '#666', margin: '4px 0 0' }}>
            Customize the enrollment page for this course
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleDelete}
            disabled={!configExists}
            style={{
              padding: '8px 16px',
              background: configExists ? '#dc2626' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: configExists ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Delete Config
          </button>
        </div>
      </div>
      
      <div style={{ 
        background: configExists ? '#e8f5e9' : '#fff3e0',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px'
      }}>
        <span style={{ fontSize: '20px' }}>{configExists ? '✅' : '📝'}</span>
        <span>
          {configExists 
            ? 'Configuration exists in database. Changes will be saved to the server.' 
            : 'No configuration saved yet. Default values will be used. Click Save to create one.'}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Join Button Text
        </label>
        <input
          type="text"
          value={config.joinButtonText || ''}
          onChange={(e) => handleChange('joinButtonText', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
          placeholder="e.g., Enroll Now, Join Course"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Share Button Text
        </label>
        <input
          type="text"
          value={config.shareButtonText || ''}
          onChange={(e) => handleChange('shareButtonText', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
          placeholder="e.g., Share, Share Course"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Primary Color
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="color"
            value={config.primaryColor || '#3abf94'}
            onChange={(e) => handleChange('primaryColor', e.target.value)}
            style={{ 
              padding: '2px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              width: '50px',
              height: '40px',
              cursor: 'pointer'
            }}
          />
          <input
            type="text"
            value={config.primaryColor || ''}
            onChange={(e) => handleChange('primaryColor', e.target.value)}
            style={{ 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '6px',
              fontSize: '14px',
              flex: 1
            }}
            placeholder="#3abf94"
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Secondary Color
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="color"
            value={config.secondaryColor || '#1a1a2e'}
            onChange={(e) => handleChange('secondaryColor', e.target.value)}
            style={{ 
              padding: '2px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              width: '50px',
              height: '40px',
              cursor: 'pointer'
            }}
          />
          <input
            type="text"
            value={config.secondaryColor || ''}
            onChange={(e) => handleChange('secondaryColor', e.target.value)}
            style={{ 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '6px',
              fontSize: '14px',
              flex: 1
            }}
            placeholder="#1a1a2e"
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Description Title
        </label>
        <input
          type="text"
          value={config.descriptionTitle || ''}
          onChange={(e) => handleChange('descriptionTitle', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
          placeholder="About This Course"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Lessons Title
        </label>
        <input
          type="text"
          value={config.lessonsTitle || ''}
          onChange={(e) => handleChange('lessonsTitle', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
          placeholder="Course Content"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Layout Style
        </label>
        <select
          value={config.layoutStyle || 'default'}
          onChange={(e) => handleChange('layoutStyle', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            fontSize: '14px',
            background: 'white'
          }}
        >
          <option value="default">Default</option>
          <option value="compact">Compact</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Show Elements
        </label>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.showRating !== false}
              onChange={(e) => handleChange('showRating', e.target.checked)}
            />
            Show Rating
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.showMembers !== false}
              onChange={(e) => handleChange('showMembers', e.target.checked)}
            />
            Show Members
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.showLastUpdate !== false}
              onChange={(e) => handleChange('showLastUpdate', e.target.checked)}
            />
            Show Last Update
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Custom CSS (Optional)
        </label>
        <textarea
          value={config.customCss || ''}
          onChange={(e) => handleChange('customCss', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            minHeight: '100px',
            fontFamily: 'monospace',
            fontSize: '13px',
            resize: 'vertical'
          }}
          placeholder="/* Add custom CSS here */"
        />
        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          Custom CSS will be applied to the enrollment page. Use with caution.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 32px',
            background: saving ? '#ccc' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {saving ? 'Saving...' : (configExists ? 'Update Configuration' : 'Create Configuration')}
        </button>
        
        <button
          onClick={loadConfig}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: '#f0f0f0',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ 
        marginTop: '16px', 
        fontSize: '13px', 
        color: '#888',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <span>Status: {configExists ? '✅ Configuration exists' : '📝 No configuration yet'}</span>
        {courseId && <span>| Course ID: {courseId}</span>}
        {config.id && <span>| Config ID: {config.id}</span>}
        {config.updatedAt && <span>| Last Updated: {new Date(config.updatedAt).toLocaleString()}</span>}
      </div>
    </div>
  );
}