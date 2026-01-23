import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2 } from 'lucide-react';
import { useTheme } from '../../Layout';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { llmService } from '@/api/chatService';

export default function ChatInterface({ transcript, videoTitle, initialMessages, onMessagesChange, videoId }) {
  const { isDark } = useTheme();
  const defaultGreeting = "Hi! Ask me about this video.";
  const getInitialMessages = () => {
    if (initialMessages && initialMessages.length > 0) return initialMessages;
    return [{
      id: 'greeting',
      text: defaultGreeting,
      isUser: false
    }];
  };
  const [messages, setMessages] = useState(getInitialMessages());
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Update messages when initialMessages change, fallback to greeting
    const nextMessages = (initialMessages && initialMessages.length > 0)
      ? initialMessages
      : [{
          id: 'greeting',
          text: defaultGreeting,
          isUser: false
        }];
    setMessages(nextMessages);
    if (onMessagesChange) {
      onMessagesChange(nextMessages);
    }
  }, [initialMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    if (onMessagesChange) {
      onMessagesChange(updatedMessages);
    }

    try {
      const response = await llmService.invokeLLM({
        prompt: `You are a helpful assistant that answers questions about a YouTube video based ONLY on its transcript. 
        
VIDEO TRANSCRIPT:
${transcript}

USER QUESTION: ${userMessage.text}

INSTRUCTIONS:
- Answer the question based ONLY on the information in the transcript above
- If the answer is not in the transcript, say "I couldn't find that information in the video transcript"
- Be concise but thorough
- Use a friendly, conversational tone
- If relevant, mention timestamps or sections of the video`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" }
          },
          required: ["answer"]
        },
        videoId: videoId
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        isUser: false,
        userQuestion: userMessage.text
      };

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      if (onMessagesChange) {
        onMessagesChange(updatedMessages);
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error 
          ? `Error: ${error.message}. Please make sure the backend server is running.`
          : "I'm sorry, I encountered an error processing your question. Please try again.",
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerate = async (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const originalMessage = messages[messageIndex];
    const userQuestion = originalMessage.userQuestion;
    if (!userQuestion) return;

    // Remove the old AI response
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setIsTyping(true);

    try {
      const response = await llmService.invokeLLM({
        prompt: `You are a helpful assistant that answers questions about a YouTube video based ONLY on its transcript. 
        
VIDEO TRANSCRIPT:
${transcript}

USER QUESTION: ${userQuestion}

INSTRUCTIONS:
- Answer the question based ONLY on the information in the transcript above
- If the answer is not in the transcript, say "I couldn't find that information in the video transcript"
- Be concise but thorough
- Use a friendly, conversational tone
- Provide a slightly different perspective or more detail than before`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" }
          },
          required: ["answer"]
        },
        videoId: videoId
      });

      const newAiMessage = {
        id: Date.now().toString(),
        text: response.answer,
        isUser: false,
        userQuestion: userQuestion
      };

      setMessages(prev => {
        const newMessages = [...prev];
        // Insert at the same position
        const insertIndex = newMessages.findIndex((m, i) => i >= messageIndex - 1 && m.isUser && m.text === userQuestion);
        if (insertIndex !== -1) {
          newMessages.splice(insertIndex + 1, 0, newAiMessage);
        } else {
          newMessages.push(newAiMessage);
        }
        return newMessages;
      });
    } catch (error) {
      const errorMessage = {
        id: Date.now().toString(),
        text: "I'm sorry, I encountered an error regenerating the response. Please try again.",
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearConversation = () => {
    const greeting = [{
      id: 'greeting',
      text: defaultGreeting,
      isUser: false
    }];
    setMessages(greeting);
    if (onMessagesChange) {
      onMessagesChange(greeting);
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isDark ? 'border-[#272727]' : 'border-gray-200'
      }`}>
        <h2 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Chat
        </h2>
        <motion.button
          onClick={clearConversation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-[#272727]' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <AnimatePresence>
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              onRegenerate={() => handleRegenerate(message.id)}
              canRegenerate={!message.isUser && message.userQuestion && index === messages.length - 1}
            />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDark ? 'border-[#272727]' : 'border-gray-200'}`}>
        <form onSubmit={handleSubmit}>
          <div className={`relative rounded-2xl transition-all duration-300 ${
            isFocused ? 'ring-2 ring-[#3EA6FF] ring-opacity-50' : ''
          } ${
            isDark ? 'bg-[#121212]' : 'bg-gray-100'
          }`}>
            <div className="flex items-center p-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask about the video..."
                disabled={isTyping}
                className={`flex-1 px-4 py-2.5 bg-transparent outline-none text-[15px] ${
                  isDark 
                    ? 'text-white placeholder-gray-500' 
                    : 'text-gray-900 placeholder-gray-400'
                } disabled:opacity-50`}
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  input.trim() && !isTyping
                    ? 'bg-[#3EA6FF] text-white hover:bg-[#2d8fd9]'
                    : isDark 
                      ? 'bg-[#272727] text-gray-500' 
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
