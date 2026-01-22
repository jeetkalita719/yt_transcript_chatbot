"""Main entry point for the YouTube transcript chatbot."""
from transcript_loader import TranscriptLoader
from text_splitter import TextSplitter
from vector_store import VectorStoreFactory
from retriever import RetrieverFactory, ContextRetriever
from chatbot import AnswerGenerator
from utils import VideoIDExtractor
from dotenv import load_dotenv


class YouTubeChatbot:
    """Main chatbot orchestrator (SRP: Single responsibility for orchestration)."""
    
    def __init__(self):
        """Initialize all components (DIP: Dependency injection ready)."""
        load_dotenv()  # Load environment variables once
        
        self.transcript_loader = TranscriptLoader()
        self.text_splitter = TextSplitter()
        self.vector_store_factory = VectorStoreFactory()
        self.retriever_factory = RetrieverFactory()
        self.answer_generator = AnswerGenerator()
        self.video_id_extractor = VideoIDExtractor()
    
    def setup(self, video_url: str):
        """Set up the chatbot with a video transcript."""
        print("Extracting video ID...")
        video_id = self.video_id_extractor.extract(video_url)
        
        print("Loading transcript...")
        transcript = self.transcript_loader.load(video_id)
        
        print("Splitting transcript...")
        chunks = self.text_splitter.split_transcript(transcript)
        
        print("Creating vector store...")
        vector_store = self.vector_store_factory.create(chunks)
        
        print("Creating retriever...")
        retriever = self.retriever_factory.create_compressed_retriever(vector_store)
        
        print("Ready! You can now ask questions.")
        return retriever
    
    def query(self, query: str, retriever) -> str:
        """Process a query and return an answer."""
        context = ContextRetriever.get_context(query, retriever)
        return self.answer_generator.generate(query, context)
    
    def run(self):
        """Run the interactive chatbot."""
        video_url = input("Enter YouTube video URL or ID: ")
        retriever = self.setup(video_url)
        
        while True:
            query = input("Ask a question (or 'quit' to exit): ")
            if query.lower() == 'quit':
                break
            
            try:
                answer = self.query(query, retriever)
                print(answer)
            except Exception as e:
                print(f"Error: {str(e)}")


if __name__ == "__main__":
    chatbot = YouTubeChatbot()
    chatbot.run()
