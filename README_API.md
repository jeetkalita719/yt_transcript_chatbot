# Backend API Server

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the root directory:
```
OPENAI_API_KEY=your_api_key_here
```

3. Start the server:
```bash
# Option 1: Using the start script
python Backend/start_server.py

# Option 2: Using uvicorn directly
cd Backend
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

The server will run on `http://localhost:8000`

## API Endpoints

### GET `/`
Health check endpoint

### GET `/api/health`
Health check endpoint

### POST `/api/transcript/{video_id}`
Fetches and processes a YouTube video transcript.

**Parameters:**
- `video_id` (path parameter): YouTube video ID

**Response:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "title": "YouTube Video dQw4w9WgXcQ",
  "transcript": "Full transcript text...",
  "duration": "Unknown"
}
```

### POST `/api/chat`
Answers a question about a YouTube video using RAG.

**Request Body:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "question": "What is this video about?"
}
```

**Response:**
```json
{
  "answer": "The video is about...",
  "video_id": "dQw4w9WgXcQ",
  "question": "What is this video about?"
}
```

### DELETE `/api/video/{video_id}`
Deletes cached vector store and transcript for a video.

**Parameters:**
- `video_id` (path parameter): YouTube video ID

**Response:**
```json
{
  "message": "Video dQw4w9WgXcQ data deleted successfully"
}
```

## Frontend Integration

The frontend is configured to call `http://localhost:8000` by default. You can change this by setting the `VITE_API_BASE_URL` environment variable in the frontend.

## Notes

- Vector stores are cached in memory and on disk (in temp directory)
- Transcripts are cached in memory
- The server uses CORS middleware to allow requests from the frontend
- Make sure your OpenAI API key is set in the `.env` file

