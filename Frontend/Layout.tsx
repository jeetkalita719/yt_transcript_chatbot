import React, { useState, useEffect, createContext, useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export default function Layout({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setIsDark(saved === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div className={`min-h-screen transition-colors duration-500 ${
        isDark ? 'bg-[#0F0F0F]' : 'bg-[#F9F9F9]'
      }`}>
        <style>{`
          :root {
            --bg-primary: ${isDark ? '#0F0F0F' : '#F9F9F9'};
            --bg-surface: ${isDark ? '#181818' : '#FFFFFF'};
            --bg-input: ${isDark ? '#121212' : '#F1F1F1'};
            --text-primary: ${isDark ? '#FFFFFF' : '#0F0F0F'};
            --text-secondary: ${isDark ? '#AAAAAA' : '#606060'};
            --accent-red: #FF0000;
            --accent-blue: #3EA6FF;
            --border-color: ${isDark ? '#272727' : '#E5E5E5'};
          }
          
          * {
            scrollbar-width: thin;
            scrollbar-color: ${isDark ? '#383838 transparent' : '#CCCCCC transparent'};
          }
          
          *::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          *::-webkit-scrollbar-track {
            background: transparent;
          }
          
          *::-webkit-scrollbar-thumb {
            background: ${isDark ? '#383838' : '#CCCCCC'};
            border-radius: 3px;
          }
          
          *::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? '#4a4a4a' : '#999999'};
          }
        `}</style>
        
        {/* Theme Toggle */}
        <motion.button
          onClick={() => setIsDark(!isDark)}
          className={`fixed top-4 right-4 z-50 p-3 rounded-full transition-colors duration-300 ${
            isDark 
              ? 'bg-[#272727] hover:bg-[#383838] text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-800 shadow-md'
          }`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? 'moon' : 'sun'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {children}
      </div>
    </ThemeContext.Provider>
  );
}
