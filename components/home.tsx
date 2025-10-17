"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageCircle, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';


const Home = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Chat with Your PDFs
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your PDF documents and start having intelligent conversations with AI.
            Ask questions, get summaries, find information, and explore your documents like never before.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => router.push('/upload')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload PDF
            </Button>
            <Button
              onClick={() => router.push('/chat')}
              variant="outline"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Chatting
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Easy Upload</h3>
              <p className="text-gray-600">
                Simply drag and drop or click to upload your PDF files. Our system supports multiple formats and handles large documents efficiently.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Intelligent Chat</h3>
              <p className="text-gray-600">
                Ask natural language questions about your documents. Get instant answers, summaries, and insights powered by advanced AI.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Analysis</h3>
              <p className="text-gray-600">
                Extract key information, find specific details, and get comprehensive analysis of your document content.
              </p>
            </div>
          </Card>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your PDF</h3>
              <p className="text-gray-600">
                Upload your PDF document using our secure upload system
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Our AI analyzes and indexes your document for intelligent searching
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Chatting</h3>
              <p className="text-gray-600">
                Ask questions and get instant, accurate answers about your content
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
