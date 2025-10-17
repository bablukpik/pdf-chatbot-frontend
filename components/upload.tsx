"use client";

import React from 'react';
import FileUploadComponent from '@/components/file-upload';
import { Card } from '@/components/ui/card';

const Upload = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload PDF Documents</h1>
          <p className="text-gray-600">
            Upload your PDF files to start chatting with AI about their content
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Card className="p-6 bg-white shadow-lg">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Upload Your PDF</h2>
                <FileUploadComponent />
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Easy Upload</h3>
              <p className="text-gray-600 text-sm">
                Simply click and select your PDF file to upload it to our system
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Processing</h3>
              <p className="text-gray-600 text-sm">
                Your documents are processed securely and privately on our servers
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Smart Chat</h3>
              <p className="text-gray-600 text-sm">
                Ask questions and get intelligent answers about your document content
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
