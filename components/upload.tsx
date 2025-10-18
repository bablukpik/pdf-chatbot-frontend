"use client";

import React from 'react';
import FileUploadComponent from '@/components/file-upload';
import { Card } from '@/components/ui/card';

const Upload = () => {
  return (
    <div className="h-full bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 h-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload PDF Documents</h1>
          <p className="text-gray-600">
            Upload your PDF files to start chatting with AI about their content
          </p>
        </div>

        <div className="flex justify-center w-full">
          <div className="w-full max-w-md">
            <Card className="p-6 bg-white shadow-lg">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Upload Your PDF</h2>
                <FileUploadComponent />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
