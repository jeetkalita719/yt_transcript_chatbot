/**
 * Chat Service
 * Handles chat session management and LLM interactions
 */

// Helper to get/set from localStorage
const getStoredChats = (): any[] => {
  try {
    const stored = localStorage.getItem('chat_sessions');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setStoredChats = (chats: any[]) => {
  localStorage.setItem('chat_sessions', JSON.stringify(chats));
};

// Chat Session Management
export const chatService = {
  // List all chat sessions
  listChats: async (sort?: string): Promise<any[]> => {
    const chats = getStoredChats();
    // Simple sort implementation
    if (sort?.startsWith('-')) {
      const field = sort.substring(1);
      return [...chats].sort((a, b) => {
        if (field === 'created_date') {
          return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
        }
        return 0;
      });
    }
    return chats;
  },

  // Create a new chat session
  createChat: async (data: any): Promise<any> => {
    const chats = getStoredChats();
    const newChat = {
      ...data,
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_date: new Date().toISOString(),
    };
    chats.push(newChat);
    setStoredChats(chats);
    return newChat;
  },

  // Update a chat session
  updateChat: async (id: string, data: any): Promise<any> => {
    const chats = getStoredChats();
    const index = chats.findIndex(chat => chat.id === id);
    if (index !== -1) {
      chats[index] = { ...chats[index], ...data };
      setStoredChats(chats);
      return chats[index];
    }
    throw new Error('Chat not found');
  },

  // Delete a chat session
  deleteChat: async (id: string): Promise<void> => {
    const chats = getStoredChats();
    const filtered = chats.filter(chat => chat.id !== id);
    setStoredChats(filtered);
  },

  // Get a chat session by ID
  getChatById: async (id: string): Promise<any | null> => {
    const chats = getStoredChats();
    const chat = chats.find(chat => chat.id === id);
    return chat || null;
  },
};

// LLM Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Store video_id for chat requests
let currentVideoId: string | null = null;

export const llmService = {
  // Set the current video ID for chat context
  setVideoId: (videoId: string) => {
    currentVideoId = videoId;
  },

  // Get the current video ID
  getVideoId: (): string | null => {
    return currentVideoId;
  },

  // Answer a question about a YouTube video using RAG
  invokeLLM: async (params: {
    prompt: string;
    response_json_schema?: any;
    videoId?: string;
  }): Promise<any> => {
    const videoId = params.videoId || currentVideoId;
    
    if (!videoId) {
      throw new Error('Video ID is required for chat');
    }

    // Extract the user question from the prompt
    // The prompt format is: "You are a helpful assistant... USER QUESTION: {question}"
    const questionMatch = params.prompt.match(/USER QUESTION:\s*(.+?)(?:\n|$)/s);
    const question = questionMatch ? questionMatch[1].trim() : params.prompt;

    try {
      // Call backend API
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          question: question,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Return in the format expected by the frontend
      if (params.response_json_schema?.properties?.answer) {
        return { answer: data.answer };
      }
      
      return data;
    } catch (error) {
      console.error('Error calling backend API:', error);
      // Throw the error instead of returning mock response
      // This allows the UI to show the actual error message
      throw new Error(
        error instanceof Error 
          ? `Backend API error: ${error.message}. Please make sure the backend server is running on ${API_BASE_URL}`
          : 'Failed to connect to backend API. Please check if the server is running.'
      );
    }
  },

  // Get transcript for a YouTube video
  getVideoTranscript: async (videoId: string): Promise<{
    title: string;
    transcript: string;
    duration: string;
  }> => {
    try {
      // Call backend API
      const response = await fetch(`${API_BASE_URL}/api/transcript/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Set the current video ID for subsequent chat requests
      currentVideoId = videoId;
      
      return {
        title: data.title || `YouTube Video ${videoId}`,
        transcript: data.transcript || '',
        duration: data.duration || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching transcript:', error);
      // Fallback to mock response if backend is not available
      return {
        title: `YouTube Video ${videoId}`,
        transcript: `Error fetching transcript: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the backend server is running and the video ID is valid.`,
        duration: 'Unknown'
      };
    }
  },
};

// Mock LLM response for when backend is not available
function mockLLMResponse(params: { prompt: string; response_json_schema?: any }): any {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if it's a transcript request
      if (params.prompt.includes('Video ID:')) {
        const videoIdMatch = params.prompt.match(/Video ID:\s*([a-zA-Z0-9_-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : 'demo';
        resolve({
          title: `YouTube Video ${videoId}`,
          transcript: `This is a demo transcript for video ${videoId}. In a real implementation, this would be fetched from the YouTube API. The transcript would contain the actual spoken words from the video. For now, this is placeholder content to demonstrate the application flow.`,
          duration: '10:30'
        });
      } else {
        // Check if it's a chat question
        if (params.response_json_schema?.properties?.answer) {
          const questionMatch = params.prompt.match(/USER QUESTION:\s*(.+)/);
          const question = questionMatch ? questionMatch[1].trim() : '';
          resolve({
            answer: `This is a mock response to your question: "${question}". In a real implementation, this would be generated by an LLM based on the video transcript. The answer would be contextually relevant to the transcript content.`
          });
        } else {
          resolve({ result: 'Mock response' });
        }
      }
    }, 1000);
  });
}

