from youtube_transcript_api import YouTubeTranscriptApi

def get_transcript(video_id):
    api = YouTubeTranscriptApi()
    fetched = api.fetch(video_id)
    transcript = fetched.to_raw_data()
    return transcript
