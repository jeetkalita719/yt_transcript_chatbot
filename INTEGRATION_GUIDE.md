# Frontend-Backend Integration Guide

## Overview

The frontend and backend are now fully integrated. The frontend React app communicates with a FastAPI backend server that handles YouTube transcript fetching, vector store creation, and RAG-based question answering.

## Architecture

```
Frontend (React + Vite)
    ↓ HTTP Requests
Backend API (FastAPI)
    ↓
LangChain + OpenAI
    ↓
YouTube Transcript API
```

## Backend Components

### API Server (`Backend/api_server.py`)
- FastAPI server with CORS enabled
- Endpoints for transcript fetching and chat
- In-memory and disk-based caching of vector stores
- Session management per video

### Core Backend Modules
- `transcript_loader.py`: Fetches YouTube transcripts
- `text_splitter.py`: Splits transcripts into chunks
- `vector_store.py`: Creates FAISS vector embeddings
- `retriever.py`: Implements contextual compression retrieval
- `chatbot.py`: Generates answers using LangChain

## Frontend Components

### Chat Service (`frontend/api/chatService.ts`)
- `chatService`: Manages chat sessions in localStorage
- `llmService`: Communicates with backend API
  - `getVideoTranscript()`: Fetches and processes video transcript
  - `invokeLLM()`: Sends questions to backend for RAG-based answers

### Updated Components
- `Chat.tsx`: Handles video loading and chat session management
- `ChatInterface.tsx`: Sends questions to backend via `llmService`

## Setup Instructions

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file with OpenAI API key
echo "OPENAI_API_KEY=your_key_here" > .env

# Start the backend server
python Backend/start_server.py
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start the frontend dev server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Environment Variables

**Backend (.env):**
```
OPENAI_API_KEY=your_openai_api_key
```

**Frontend (.env or .env.local):**
```
VITE_API_BASE_URL=http://localhost:8000
```

## API Flow

### 1. User Pastes YouTube URL
- Frontend extracts video ID
- User clicks "Start Chat"

### 2. Transcript Fetching
```
Frontend → POST /api/transcript/{video_id}
Backend → Fetches transcript from YouTube
Backend → Creates vector store
Backend → Returns transcript text
Frontend → Stores in chat session
```

### 3. User Asks Question
```
Frontend → POST /api/chat {video_id, question}
Backend → Loads vector store for video
Backend → Retrieves relevant context
Backend → Generates answer using LLM
Backend → Returns answer
Frontend → Displays answer
```

## Key Features

1. **Caching**: Vector stores are cached in memory and on disk
2. **Session Management**: Each video has its own vector store
3. **Error Handling**: Graceful fallbacks if backend is unavailable
4. **CORS**: Backend configured to accept frontend requests
5. **RAG**: Uses contextual compression and multi-query retrieval

## Testing

1. Start both servers (backend and frontend)
2. Open frontend in browser
3. Paste a YouTube video URL
4. Wait for transcript to load
5. Ask questions about the video

## Troubleshooting

### Backend not responding
- Check if server is running on port 8000
- Verify OpenAI API key is set in `.env`
- Check console for error messages

### CORS errors
- Ensure backend CORS middleware includes frontend URL
- Check that frontend is using correct API base URL

### Transcript fetch fails
- Verify video has captions/transcripts available
- Check YouTube API is accessible
- Some videos may not have transcripts

### Chat not working
- Ensure transcript was fetched successfully first
- Check that vector store was created
- Verify OpenAI API key is valid

## Next Steps

- Add video title fetching from YouTube API
- Implement video duration extraction
- Add persistent storage for chat sessions
- Implement user authentication
- Add rate limiting
- Deploy to production

