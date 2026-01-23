from transcript_loader import get_transcript
from text_splitter import split_transcript
from vector_store import create_vector_store
from retriever import create_compressed_retriever, get_context
from chatbot import get_answer
from dotenv import load_dotenv
import re

load_dotenv()

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$'  # If it's already just the ID
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    raise ValueError("Invalid YouTube URL or video ID")

video_url = input("Enter YouTube video URL or ID: ")
video_id = extract_video_id(video_url)
print("Loading transcript...")
transcript = get_transcript(video_id)
print("Splitting transcript...")
chunks = split_transcript(transcript)
print("Creating vector store...")
vector_store = create_vector_store(chunks)
print("Creating hybrid retriever (BM25 + Vector)...")
retriever = create_compressed_retriever(vector_store, chunks=chunks, k=5)
print("Ready! You can now ask questions.")

while True:
    query = input("Ask a question (or 'quit' to exit): ")
    if query.lower() == 'quit':
        break
    
    context = get_context(query, retriever)
    answer = get_answer(query, context)
    print(answer)
