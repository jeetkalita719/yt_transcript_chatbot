"""Utility functions for the application."""
import re
from typing import Optional
from config import app_config


class VideoIDExtractor:
    """Extracts video ID from YouTube URLs (SRP: Single responsibility)."""
    
    def __init__(self, patterns: Optional[tuple] = None):
        """Initialize with patterns (DIP: Dependency injection)."""
        self.patterns = patterns or app_config.youtube_patterns
    
    def extract(self, url: str) -> str:
        """Extract video ID from URL or return the ID if already provided."""
        for pattern in self.patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        raise ValueError("Invalid YouTube URL or video ID")

