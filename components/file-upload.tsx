'use client';
import * as React from 'react';
import { Upload } from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const FileUploadComponent: React.FC = () => {
  const [status, setStatus] = React.useState<UploadStatus>('idle');
  const [statusMessage, setStatusMessage] =
    React.useState<string>('Upload PDF File');

  const handleFileUploadButtonClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');
    el.addEventListener('change', async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          setStatus('uploading');
          setStatusMessage('Uploading...');
          const formData = new FormData();
          formData.append('pdf', file);

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/upload/pdf`,
              {
                method: 'POST',
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error('Upload failed');
            }

            setStatus('success');
            setStatusMessage('File uploaded successfully!');
          } catch (error) {
            setStatus('error');
            setStatusMessage('Upload failed. Please try again.');
            console.error(error);
          } finally {
            // Reset after a few seconds
            setTimeout(() => {
              setStatus('idle');
              setStatusMessage('Upload PDF File');
            }, 3000);
          }
        }
      }
    });
    el.click();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'border-yellow-400';
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-white';
    }
  };

  return (
    <div
      className={`bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-lg border-2 transition-all ${getStatusColor()}`}
    >
      <div
        onClick={status === 'uploading' ? undefined : handleFileUploadButtonClick}
        className={`flex justify-center items-center flex-col ${status !== 'uploading' ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
      >
        <h3>{statusMessage}</h3>
        <Upload />
      </div>
    </div>
  );
};

export default FileUploadComponent;
