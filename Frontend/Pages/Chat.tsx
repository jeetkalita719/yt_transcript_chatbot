import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Play, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../Layout';
import { createPageUrl } from '../utils';
import ChatInterface from '../Components/chat/ChatInterface';
import TranscriptPanel from '../Components/chat/TranscriptPanel';
import LoadingSkeleton from '../Components/chat/LoadingSkeleton';
import { chatService, llmService } from '@/api/chatService';
import { useMutation } from '@tanstack/react-query';

export default function Chat() {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create chat mutation
  const createChatMutation = useMutation({
    mutationFn: (chatData) => {
      console.log('createChatMutation.mutate called with:', chatData);
      return chatService.createChat(chatData);
    },
    onSuccess: (newChat) => {
      console.log('Chat created successfully:', newChat);
      setIsLoading(false);
      // Navigate to the chat with the new chat ID
      window.location.href = createPageUrl(`Chat?chatId=${newChat.id}`);
    },
    onError: (error) => {
      console.error('Error creating chat:', error);
      setIsLoading(false);
      alert('Failed to create chat session. Please try again.');
    },
  });

  // Update chat mutation
  const updateChatMutation = useMutation({
    mutationFn: ({ id, data }) => chatService.updateChat(id, data),
  });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const chatId = searchParams.get('chatId');
    const videoId = searchParams.get('videoId');
    
    console.log('Chat useEffect triggered:', { chatId, videoId });
    
    if (chatId) {
      loadExistingChat(chatId);
    } else if (videoId) {
      createNewChat(videoId);
    } else {
      console.log('No chatId or videoId, redirecting to Home');
      window.location.href = createPageUrl('Home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadExistingChat = async (chatId) => {
    setIsLoading(true);
    try {
      const chatData = await chatService.getChatById(chatId);
      if (chatData) {
        setCurrentChat(chatData);
        // Set video ID for chat service
        if (chatData.video_id) {
          llmService.setVideoId(chatData.video_id);
        }
      } else {
        window.location.href = createPageUrl('Home');
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      window.location.href = createPageUrl('Home');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async (videoId) => {
    console.log('createNewChat called with videoId:', videoId);
    setIsLoading(true);
    
    try {
      // Set video ID for chat service
      llmService.setVideoId(videoId);
      console.log('Fetching transcript for video:', videoId);
      const response = await llmService.getVideoTranscript(videoId);
      console.log('Transcript received:', response);

      const chatData = {
        video_id: videoId,
        video_title: response.title,
        video_thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        video_duration: response.duration || '10:00',
        transcript: response.transcript,
        messages: []
      };

      console.log('Creating chat with data:', chatData);
      createChatMutation.mutate(chatData);
    } catch (error) {
      console.error('Error loading transcript:', error);
      // Even on error, create a chat session so user can still interact
      const chatData = {
        video_id: videoId,
        video_title: 'YouTube Video',
        video_thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        video_duration: '10:00',
        transcript: error instanceof Error ? `Error: ${error.message}` : 'This is a demo transcript. The actual transcript could not be loaded. You can still ask questions and the AI will respond based on this placeholder content.',
        messages: []
      };
      console.log('Creating chat with fallback data:', chatData);
      createChatMutation.mutate(chatData);
    }
    // Note: Don't set isLoading to false here - let the mutation handle it
  };

  const handleMessagesChange = (messages) => {
    if (currentChat) {
      updateChatMutation.mutate({
        id: currentChat.id,
        data: { messages }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center px-4 py-8"
            >
              <LoadingSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Content */}
        <AnimatePresence>
          {currentChat && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Video Info Bar */}
              <div className={`px-4 py-3 border-b ${
                isDark ? 'border-[#272727]' : 'border-gray-200'
              }`}>
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={createPageUrl('Home')}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'hover:bg-[#272727] text-gray-400' 
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    
                    <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={currentChat.video_thumbnail}
                        alt={currentChat.video_title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${currentChat.video_id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h2 className={`font-medium text-sm truncate ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {currentChat.video_title}
                      </h2>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {currentChat.video_duration}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setShowTranscript(!showTranscript)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      showTranscript
                        ? 'bg-[#3EA6FF] text-white'
                        : isDark 
                          ? 'bg-[#272727] text-white hover:bg-[#383838]' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Transcript</span>
                  </motion.button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Chat Interface */}
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                  <div className={`flex-1 overflow-hidden rounded-2xl mx-4 my-4 ${
                    isDark ? 'bg-[#181818]' : 'bg-white shadow-lg'
                  }`}>
                    <ChatInterface 
                      transcript={currentChat.transcript}
                      videoTitle={currentChat.video_title}
                      initialMessages={currentChat.messages}
                      onMessagesChange={handleMessagesChange}
                      videoId={currentChat.video_id}
                    />
                  </div>
                </div>

                {/* Desktop Transcript Panel */}
                {!isMobile && (
                  <TranscriptPanel
                    transcript={currentChat.transcript}
                    isOpen={showTranscript}
                    onToggle={() => setShowTranscript(false)}
                    isMobile={false}
                  />
                )}
              </div>

              {/* Mobile Transcript Panel */}
              {isMobile && (
                <TranscriptPanel
                  transcript={currentChat.transcript}
                  isOpen={showTranscript}
                  onToggle={() => setShowTranscript(false)}
                  isMobile={true}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
