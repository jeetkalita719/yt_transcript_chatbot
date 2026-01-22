"""Module for splitting text into chunks."""
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict, Any, Optional
from config import app_config


class TextSplitter:
    """Handles text splitting into chunks (SRP: Single responsibility)."""
    
    def __init__(self, chunk_size: Optional[int] = None, chunk_overlap: Optional[int] = None):
        """Initialize with configurable parameters (DIP: Dependency injection)."""
        self.chunk_size = chunk_size or app_config.chunk_size
        self.chunk_overlap = chunk_overlap or app_config.chunk_overlap
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap
        )
    
    def split_transcript(self, transcript: List[Dict[str, Any]]) -> List[str]:
        """Split transcript into text chunks."""
        text = " ".join([item['text'] for item in transcript])
        return self._splitter.split_text(text)


def split_transcript(transcript: List[Dict[str, Any]]) -> List[str]:
    """Convenience function for backward compatibility."""
    splitter = TextSplitter()
    return splitter.split_transcript(transcript)
