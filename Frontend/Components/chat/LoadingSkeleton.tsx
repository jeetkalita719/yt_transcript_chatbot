import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Layout';

export default function LoadingSkeleton() {
  const { isDark } = useTheme();
  
  const shimmer = {
    hidden: { x: '-100%' },
    visible: { 
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear'
      }
    }
  };

  const SkeletonLine = ({ width = '100%', height = '16px', className = '' }) => (
    <div 
      className={`relative overflow-hidden rounded ${className}`}
      style={{ 
        width, 
        height,
        backgroundColor: isDark ? '#272727' : '#E5E5E5'
      }}
    >
      <motion.div
        variants={shimmer}
        initial="hidden"
        animate="visible"
        className="absolute inset-0"
        style={{
          background: isDark 
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
        }}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      {/* Video Info Skeleton */}
      <div className={`rounded-2xl p-6 mb-6 ${
        isDark ? 'bg-[#181818]' : 'bg-white shadow-lg'
      }`}>
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <SkeletonLine width="160px" height="90px" className="rounded-xl flex-shrink-0" />
          
          <div className="flex-1 space-y-3">
            {/* Title */}
            <SkeletonLine width="80%" height="20px" />
            <SkeletonLine width="60%" height="20px" />
            
            {/* Channel */}
            <div className="flex items-center gap-2 pt-2">
              <SkeletonLine width="32px" height="32px" className="rounded-full" />
              <SkeletonLine width="120px" height="14px" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="inline-flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className={`w-5 h-5 border-2 rounded-full ${
              isDark 
                ? 'border-gray-600 border-t-[#FF0000]' 
                : 'border-gray-300 border-t-[#FF0000]'
            }`}
          />
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading transcript...
          </span>
        </div>
      </motion.div>

      {/* Chat Preview Skeleton */}
      <div className={`rounded-2xl mt-6 overflow-hidden ${
        isDark ? 'bg-[#181818]' : 'bg-white shadow-lg'
      }`}>
        <div className={`px-4 py-3 border-b ${
          isDark ? 'border-[#272727]' : 'border-gray-200'
        }`}>
          <SkeletonLine width="60px" height="16px" />
        </div>
        
        <div className="p-4 space-y-4">
          {/* AI Message */}
          <div className="flex items-start gap-3">
            <SkeletonLine width="32px" height="32px" className="rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <SkeletonLine width="90%" height="40px" className="rounded-2xl" />
            </div>
          </div>
          
          {/* User Message */}
          <div className="flex items-start gap-3 flex-row-reverse">
            <SkeletonLine width="32px" height="32px" className="rounded-full flex-shrink-0" />
            <div className="space-y-2">
              <SkeletonLine width="200px" height="36px" className="rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Input Skeleton */}
        <div className={`p-4 border-t ${isDark ? 'border-[#272727]' : 'border-gray-200'}`}>
          <SkeletonLine width="100%" height="48px" className="rounded-2xl" />
        </div>
      </div>
    </motion.div>
  );
}
