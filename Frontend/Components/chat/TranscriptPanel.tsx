import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTheme } from '../../Layout';

export default function TranscriptPanel({ transcript, isOpen, onToggle, isMobile }) {
  const { isDark } = useTheme();

  // Desktop Panel
  if (!isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 350, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`h-full border-l overflow-hidden ${
              isDark ? 'bg-[#181818] border-[#272727]' : 'bg-white border-gray-200'
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${
                isDark ? 'border-[#272727]' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Transcript
                  </h3>
                </div>
                <motion.button
                  onClick={onToggle}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-[#272727] text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {transcript}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Mobile Bottom Sheet
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[70vh] ${
              isDark ? 'bg-[#181818]' : 'bg-white'
            }`}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-10 h-1 rounded-full ${
                isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`} />
            </div>

            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-2 border-b ${
              isDark ? 'border-[#272727]' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <FileText className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Transcript
                </h3>
              </div>
              <motion.button
                onClick={onToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-[#272727] text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4 max-h-[calc(70vh-80px)]">
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {transcript}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
