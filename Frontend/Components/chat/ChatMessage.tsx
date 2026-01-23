import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { useTheme } from '../../Layout';

export default function ChatMessage({ message, isUser, onRegenerate, canRegenerate }) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <motion.div 
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-[#3EA6FF]' 
            : isDark ? 'bg-[#272727]' : 'bg-gray-100'
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <span className="text-xs">{isUser ? '👤' : '🤖'}</span>
      </motion.div>

      {/* Message Content */}
      <div className={`group relative max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-[#3EA6FF] text-white rounded-tr-md' 
            : isDark 
              ? 'bg-[#272727] text-white rounded-tl-md' 
              : 'bg-gray-100 text-gray-900 rounded-tl-md'
        }`}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>

        {/* Action Buttons (AI messages only) */}
        {!isUser && (
          <motion.div 
            className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.button
              onClick={handleCopy}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-[#272727] text-gray-500 hover:text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
              title="Copy response"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </motion.button>
            
            {canRegenerate && (
              <motion.button
                onClick={onRegenerate}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ rotate: { duration: 0.3 } }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-[#272727] text-gray-500 hover:text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }`}
                title="Regenerate response"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
