import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Play } from 'lucide-react';
import { useTheme } from '../Layout';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Home() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = extractVideoId(url);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div 
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo Header */}
        <motion.div 
          className="flex items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-3 bg-[#FF0000] rounded-2xl shadow-lg shadow-red-500/20">
            <Youtube className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-semibold tracking-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Video Chat AI
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          className={`text-center text-lg mb-8 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Chat with any YouTube video using AI
        </motion.p>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={`relative rounded-2xl transition-all duration-300 ${
            isFocused 
              ? 'ring-2 ring-[#3EA6FF] ring-opacity-50' 
              : ''
          } ${
            isDark ? 'bg-[#121212]' : 'bg-white shadow-lg'
          }`}>
            <div className="flex items-center p-2">
              <div className={`pl-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Youtube className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Paste a YouTube video link..."
                className={`flex-1 px-4 py-4 bg-transparent outline-none text-base ${
                  isDark 
                    ? 'text-white placeholder-gray-500' 
                    : 'text-gray-900 placeholder-gray-400'
                }`}
              />
              <motion.button
                type="button"
                disabled={!videoId}
                onClick={(e) => {
                  e.preventDefault();
                  if (videoId) {
                    console.log('Start Chat clicked with videoId:', videoId);
                    // Use navigate with path (HashRouter handles the # automatically)
                    navigate(`/chat?videoId=${videoId}`);
                  }
                }}
                whileHover={videoId ? { scale: 1.02, y: -1 } : {}}
                whileTap={videoId ? { scale: 0.98 } : {}}
                className={`mr-2 px-6 py-3 rounded-full font-medium text-sm text-white transition-all duration-200 ${
                  videoId
                    ? 'bg-[#FF0000] hover:bg-[#CC0000] shadow-lg shadow-red-500/20 cursor-pointer'
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                Start Chat
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Caption */}
        <motion.p 
          className={`text-center text-sm mt-6 ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Ask anything about the video. Answers are generated only from its transcript.
        </motion.p>

        {/* Video Thumbnail Preview */}
        <AnimatePresence>
          {thumbnailUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <div className={`relative rounded-2xl overflow-hidden ${
                isDark ? 'bg-[#181818]' : 'bg-white shadow-xl'
              }`}>
                <div className="relative aspect-video">
                  <img
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-9 h-9 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
