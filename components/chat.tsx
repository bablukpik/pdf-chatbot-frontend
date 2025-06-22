'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}
interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, streamingContent]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setStreamingContent('');
    const userMessage: IMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat?message=${encodeURIComponent(currentMessage)}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      let documents: Doc[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Streaming complete
              const assistantMessage: IMessage = {
                role: 'assistant',
                content: fullContent,
                documents: documents,
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingContent('');
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              }
              if (parsed.documents) {
                documents = parsed.documents;
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (e: any) {
      setError(e.message);
      // Remove the user message if the call fails
      setMessages((prev) => prev.slice(0, prev.length - 1));
    } finally {
      setLoading(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendChatMessage();
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-grow mb-4 overflow-y-auto pr-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end my-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-2xl ${msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900'
                }`}
            >
              <p>{msg.content}</p>
              {msg.documents && msg.documents.length > 0 && (
                <div className="mt-2 border-t border-gray-400 pt-2">
                  <h4 className="font-semibold text-xs mb-1">Sources:</h4>
                  {msg.documents.map((doc, i) => (
                    <div
                      key={i}
                      className="text-xs p-2 bg-slate-300 rounded-md mt-1"
                    >
                      <p className="italic">
                        &quot;{doc.pageContent?.slice(0, 150)}...&quot;
                      </p>
                      <p className="text-right mt-1 font-medium">
                        Page: {doc.metadata?.loc?.pageNumber}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 p-4 rounded-lg max-w-2xl">
              <p>{streamingContent}</p>
              <span className="animate-pulse">▋</span>
            </div>
          </div>
        )}
        {loading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 p-4 rounded-lg">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="flex justify-center mb-2">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here"
          disabled={loading}
        />
        <Button
          onClick={handleSendChatMessage}
          disabled={!message.trim() || loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};
export default ChatComponent;
