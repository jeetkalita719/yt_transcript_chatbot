"""
FastAPI server for YouTube Transcript RAG Chatbot
Provides REST API endpoints for frontend integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import os
import pickle
import tempfile
import shutil
from pathlib import Path

from transcript_loader import get_transcript
from text_splitter import split_transcript
from vector_store import create_vector_store
from retriever import create_compressed_retriever, get_context
from chatbot import get_answer

app = FastAPI(title="YouTube Transcript RAG Chatbot API")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for vector stores (in production, use Redis or database)
vector_stores: Dict[str, any] = {}
transcript_cache: Dict[str, dict] = {}
chunks_cache: Dict[str, List[str]] = {}  # Store chunks for hybrid search

# Temporary directory for storing vector stores on disk
TEMP_DIR = Path(tempfile.gettempdir()) / "yt_chatbot_vectorstores"
TEMP_DIR.mkdir(exist_ok=True)


class ChatRequest(BaseModel):
    video_id: str
    question: str


class TranscriptRequest(BaseModel):
    video_id: str


class VideoInfo(BaseModel):
    video_id: str
    title: Optional[str] = None
    transcript: str
    duration: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "YouTube Transcript RAG Chatbot API", "status": "running"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/transcript/{video_id}")
async def get_video_transcript(video_id: str):
    """
    Fetch and process YouTube video transcript
    Returns transcript text and creates vector store
    """
    try:
        # Check cache first
        if video_id in transcript_cache:
            cached = transcript_cache[video_id]
            return {
                "video_id": video_id,
                "title": cached.get("title", f"YouTube Video {video_id}"),
                "transcript": cached["transcript"],
                "duration": cached.get("duration", "Unknown")
            }

        # Fetch transcript
        transcript_data = get_transcript(video_id)
        
        # Convert transcript list to text
        # transcript_data is a list of dicts with 'text', 'start', 'duration' keys
        transcript_text = " ".join([item['text'] for item in transcript_data])
        
        # Split transcript into chunks (split_transcript expects the raw transcript data)
        chunks = split_transcript(transcript_data)
        
        # Create vector store
        vector_store = create_vector_store(chunks)
        
        # Store vector store and chunks (in memory for now)
        vector_stores[video_id] = vector_store
        chunks_cache[video_id] = chunks
        
        # Also save to disk for persistence using FAISS native methods
        store_dir = TEMP_DIR / video_id
        store_dir.mkdir(exist_ok=True)
        vector_store.save_local(str(store_dir))
        
        # Save chunks separately
        chunks_path = TEMP_DIR / f"{video_id}_chunks.pkl"
        with open(chunks_path, 'wb') as f:
            pickle.dump(chunks, f)
        
        # Cache transcript info
        transcript_cache[video_id] = {
            "transcript": transcript_text,
            "title": f"YouTube Video {video_id}",
            "duration": "Unknown"
        }
        
        return {
            "video_id": video_id,
            "title": f"YouTube Video {video_id}",
            "transcript": transcript_text,
            "duration": "Unknown"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transcript: {str(e)}")


@app.post("/api/chat")
async def chat_with_video(request: ChatRequest):
    """
    Answer a question about a YouTube video using RAG
    """
    try:
        video_id = request.video_id
        question = request.question
        
        # Load vector store and chunks if not in memory
        if video_id not in vector_stores:
            store_dir = TEMP_DIR / video_id
            chunks_path = TEMP_DIR / f"{video_id}_chunks.pkl"
            
            # Check if FAISS index exists
            index_path = store_dir / "index.faiss"
            if index_path.exists():
                # Load FAISS vector store using native method
                from langchain_community.vectorstores import FAISS
                from langchain_openai import OpenAIEmbeddings
                embeddings = OpenAIEmbeddings()
                vector_stores[video_id] = FAISS.load_local(str(store_dir), embeddings, allow_dangerous_deserialization=True)
                
                # Load chunks
                if chunks_path.exists():
                    with open(chunks_path, 'rb') as f:
                        chunks_cache[video_id] = pickle.load(f)
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"Video {video_id} not processed. Please fetch transcript first."
                )
        
        vector_store = vector_stores[video_id]
        chunks = chunks_cache.get(video_id)  # Get chunks for hybrid search
        
        # Determine k based on question type (summaries need more context)
        query_lower = question.lower()
        is_summary_request = any(word in query_lower for word in ['summary', 'summarize', 'overview', 'what is this video about', 'what does this video'])
        k = 10 if is_summary_request else 5  # More chunks for summaries
        
        # Create hybrid retriever (BM25 + Vector)
        retriever = create_compressed_retriever(vector_store, chunks=chunks, k=k)
        
        # Get context
        context = get_context(question, retriever)
        
        # Validate context
        if not context or len(context.strip()) < 50:
            # If retrieval failed, try to get more chunks or use fallback
            if chunks:
                # Try with more chunks
                retriever = create_compressed_retriever(vector_store, chunks=chunks, k=min(20, len(chunks)))
                context = get_context(question, retriever)
        
        # Get answer
        answer = get_answer(question, context)
        
        return {
            "answer": answer,
            "video_id": video_id,
            "question": question
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@app.delete("/api/video/{video_id}")
async def delete_video_data(video_id: str):
    """
    Delete cached vector store and transcript for a video
    """
    try:
        # Remove from memory
        if video_id in vector_stores:
            del vector_stores[video_id]
        
        if video_id in transcript_cache:
            del transcript_cache[video_id]
        
        if video_id in chunks_cache:
            del chunks_cache[video_id]
        
        # Remove from disk
        store_dir = TEMP_DIR / video_id
        chunks_path = TEMP_DIR / f"{video_id}_chunks.pkl"
        
        # Remove FAISS directory
        if store_dir.exists():
            import shutil
            shutil.rmtree(store_dir)
        
        # Remove chunks file
        if chunks_path.exists():
            chunks_path.unlink()
        
        return {"message": f"Video {video_id} data deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting video data: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

