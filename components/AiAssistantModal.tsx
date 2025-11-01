import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

interface AiAssistantModalProps {
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  sources?: any[];
}

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: input,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const aiText = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      const aiMessage: Message = { sender: 'ai', text: aiText, sources: groundingChunks };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: Message = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Icon name="sparkles" className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
             <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <Icon name="sparkles" className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">EAGOX AI Assistant</h3>
                <p>Ask me anything! I have access to Google Search for up-to-date info.</p>
              </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 border-t border-gray-300 dark:border-gray-600 pt-2">
                    <h4 className="text-xs font-bold mb-1">Sources:</h4>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {msg.sources.map((source, i) => (
                        source.web && (
                          <li key={i}>
                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                              {source.web.title || source.web.uri}
                            </a>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-lg p-3 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center gap-2">
                <Spinner />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || input.trim() === ''}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="send" className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AiAssistantModal;
