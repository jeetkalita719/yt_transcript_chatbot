"""Module for loading YouTube transcripts."""
from youtube_transcript_api import YouTubeTranscriptApi
from typing import List, Dict, Any, Optional


class TranscriptLoader:
    """Handles YouTube transcript loading (SRP: Single responsibility)."""
    
    def __init__(self, api: Optional[YouTubeTranscriptApi] = None):
        """Initialize with optional API instance (DIP: Dependency injection)."""
        self.api = api or YouTubeTranscriptApi()
    
    def load(self, video_id: str) -> List[Dict[str, Any]]:
        """Load transcript for a given video ID."""
        try:
            fetched = self.api.fetch(video_id)
            return fetched.to_raw_data()
        except Exception as e:
            raise ValueError(f"Failed to load transcript: {str(e)}")


def get_transcript(video_id: str) -> List[Dict[str, Any]]:
    """Convenience function for backward compatibility."""
    loader = TranscriptLoader()
    return loader.load(video_id)
