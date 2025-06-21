'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';

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
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    const userMessage: IMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat?message=${message}`
      );
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      const data = await res.json();
      const assistantMessage: IMessage = {
        role: 'assistant',
        content: data?.message,
        documents: data?.docs,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      setError(e.message);
      // remove the user message if the call fails
      setMessages((prev) => prev.slice(0, prev.length - 1));
    } finally {
      setLoading(false);
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
                        "{doc.pageContent?.slice(0, 150)}..."
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
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 p-4 rounded-lg">
              Typing...
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
