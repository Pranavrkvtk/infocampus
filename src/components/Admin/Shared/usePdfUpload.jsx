// src/components/Admin/Shared/usePdfUpload.js
import { useState, useRef, useCallback } from 'react';
import axiosInstance from '../../../api/axios';

export function usePdfUpload({ subtopicId, toast, onSuccess, endpoint }) {
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const cancelRef = useRef(false);

  const uploadDocument = useCallback(async (file) => {
    if (!file) return;
    
    // Validate PDF by MIME type
    if (file.type !== 'application/pdf') {
      if (toast) toast.show('❌ Only PDF files are allowed. Please select a PDF file.', 'error');
      return;
    }
    
    // Additional extension check
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'pdf') {
      if (toast) toast.show('❌ Only PDF files are allowed. Please select a PDF file.', 'error');
      return;
    }

    cancelRef.current = false;
    setFileName(file.name);
    setProgress(0);
    setShowProgress(true);
    setUploadingDoc(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const progressInterval = setInterval(() => {
        if (cancelRef.current) {
          clearInterval(progressInterval);
          return;
        }
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          let increment;
          if (prev < 30) increment = Math.floor(Math.random() * 8) + 3;
          else if (prev < 60) increment = Math.floor(Math.random() * 5) + 2;
          else increment = Math.floor(Math.random() * 3) + 1;
          return Math.min(prev + increment, 95);
        });
      }, 400);

      const response = await axiosInstance.post(
        endpoint || `/admin/subtopics/${subtopicId}/upload-pdf`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (cancelRef.current) return;
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(Math.min(percentCompleted, 98));
            }
          }
        }
      );
      
      clearInterval(progressInterval);
      
      if (cancelRef.current) {
        setShowProgress(false);
        setUploadingDoc(false);
        if (toast) toast.show('Upload cancelled', 'error');
        return;
      }
      
      const data = response.data;
      setProgress(100);
      
      if (onSuccess) {
        await onSuccess(data);
      }
      
      setTimeout(() => {
        setShowProgress(false);
        setUploadingDoc(false);
        if (toast) toast.show(`✅ Document processed: ${data.imageCount ?? 0} image(s) extracted.`, 'success');
      }, 800);
      
    } catch (err) {
      console.error('Upload error:', err);
      setShowProgress(false);
      setUploadingDoc(false);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Upload failed';
      if (toast) toast.show(msg, 'error');
    } finally {
      setUploadingDoc(false);
    }
  }, [subtopicId, toast, onSuccess, endpoint]);

  const handleCancelUpload = useCallback(() => {
    cancelRef.current = true;
    setShowProgress(false);
    setUploadingDoc(false);
    if (toast) toast.show('Upload cancelled', 'error');
  }, [toast]);

  return {
    uploadingDoc,
    showProgress,
    progress,
    fileName,
    uploadDocument,
    handleCancelUpload,
  };
}