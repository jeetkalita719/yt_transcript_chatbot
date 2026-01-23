import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, MessageSquare, Play, X } from 'lucide-react';
import { useTheme } from '../../Layout';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ChatSidebar({ 
  chats, 
  currentChatId, 
  onDeleteChat, 
  onNewChat, 
  canCreateNew,
  isOpen,
  onClose,
  isMobile 
}) {
  const { isDark } = useTheme();

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isDark ? 'border-[#272727]' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Chats
          </h3>
        </div>
        {isMobile && (
          <motion.button
            onClick={onClose}
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
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <motion.button
          onClick={onNewChat}
          disabled={!canCreateNew}
          whileHover={canCreateNew ? { scale: 1.02 } : {}}
          whileTap={canCreateNew ? { scale: 0.98 } : {}}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            canCreateNew
              ? isDark
                ? 'bg-[#3EA6FF] text-white hover:bg-[#2d8fd9]'
                : 'bg-[#3EA6FF] text-white hover:bg-[#2d8fd9]'
              : isDark
                ? 'bg-[#272727] text-gray-600 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </motion.button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <AnimatePresence>
          {chats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <MessageSquare className={`w-12 h-12 mx-auto mb-3 ${
                isDark ? 'text-gray-700' : 'text-gray-300'
              }`} />
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                No chats yet
              </p>
            </motion.div>
          ) : (
            chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-2"
              >
                <Link to={createPageUrl(`Chat?chatId=${chat.id}`)}>
                  <div
                    className={`group relative rounded-xl p-3 transition-all duration-200 ${
                      currentChatId === chat.id
                        ? isDark
                          ? 'bg-[#272727] ring-1 ring-[#3EA6FF]'
                          : 'bg-gray-100 ring-1 ring-[#3EA6FF]'
                        : isDark
                          ? 'hover:bg-[#272727]'
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="relative w-12 h-8 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={chat.video_thumbnail}
                          alt={chat.video_title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${chat.video_id}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-3 h-3 text-white" fill="white" />
                        </div>
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium truncate mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {chat.video_title}
                        </h4>
                        <p className={`text-xs ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {chat.messages?.length || 0} messages
                        </p>
                      </div>

                      {/* Delete Button */}
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
                          isDark
                            ? 'hover:bg-[#383838] text-gray-500 hover:text-red-400'
                            : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed left-0 top-0 bottom-0 w-80 z-50 ${
                isDark ? 'bg-[#181818]' : 'bg-white shadow-xl'
              }`}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar
  return (
    <div className={`w-80 h-full border-r ${
      isDark ? 'bg-[#181818] border-[#272727]' : 'bg-white border-gray-200'
    }`}>
      {sidebarContent}
    </div>
  );
}
