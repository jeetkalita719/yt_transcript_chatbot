import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Layout';

export default function TypingIndicator() {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isDark ? 'bg-[#272727]' : 'bg-gray-100'
      }`}>
        <span className="text-xs">🤖</span>
      </div>
      <div className={`px-4 py-3 rounded-2xl rounded-tl-md ${
        isDark ? 'bg-[#272727]' : 'bg-gray-100'
      }`}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                isDark ? 'bg-gray-500' : 'bg-gray-400'
              }`}
              animate={{
                y: [0, -6, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
