"""Configuration constants for the application."""
from dataclasses import dataclass
from typing import Optional


@dataclass
class Config:
    """Application configuration."""
    # Text splitting
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # Retrieval
    retrieval_k: int = 5
    
    # LLM settings
    llm_temperature: float = 0.0
    
    # YouTube patterns
    youtube_patterns: tuple = (
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$'
    )


# Global configuration instance
app_config = Config()

