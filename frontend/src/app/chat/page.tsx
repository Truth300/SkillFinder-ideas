'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Chat() {
  // 1. Manually handle local state for the chat input field
  const [input, setInput] = useState('');

  // 2. Extract 'status' and provide a DefaultChatTransport object for your custom endpoint URL
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: 'http://localhost:3001/api/chat',
    }),
    maxSteps: 5,
  });

  // 3. Derive a loading boolean safely based on the updated SDK status definitions
  const isLoading = status === 'submitted' || status === 'streaming';

  // 4. Custom form submission logic matching the updated SDK transmission signature
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto pb-20 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <p className="text-xl font-semibold mb-2">Hello! How can I help you today?</p>
            <p className="text-sm">I can search the web and assist you with your tasks.</p>
          </div>
        )}
        
        {messages.map((m) => {
          // Extract text contents out of the consolidated AI SDK 5 message parts layout
          const textContent = m.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('');

          // Extract tool invocations out of the message parts array layout
          const toolInvocations = m.parts.filter(
            (part) => part.type === 'tool-invocation'
          );

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                }`}
              >
                {textContent && (
                  <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
                    {textContent}
                  </div>
                )}
                
                {/* Tool Calling UI parsed dynamically out of part elements */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {toolInvocations.map((toolPart: any) => {
                  const invocation = toolPart.toolInvocation;
                  const toolCallId = invocation.toolCallId;
                  return (
                    <div key={toolCallId} className="mt-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium mb-1">
                        {invocation.state !== 'result' ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                        {invocation.toolName === 'webSearch' ? 'Searching the web...' : 'Using tool...'}
                      </div>
                      {invocation.state === 'result' && invocation.result?.answer && (
                        <div className="mt-2 text-slate-700 dark:text-slate-300">
                          {invocation.result.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <form 
        onSubmit={handleFormSubmit}
        className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[56px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
