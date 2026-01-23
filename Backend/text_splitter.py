from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def split_transcript(transcript):
    # Convert transcript list to a single text string
    text = " ".join([item['text'] for item in transcript])
    
    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    
    # Split the text
    chunks = text_splitter.split_text(text)
    return chunks

def split_transcript_to_documents(transcript):
    """
    Split transcript into Document objects for use with retrievers
    """
    # Convert transcript list to a single text string
    text = " ".join([item['text'] for item in transcript])
    
    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    
    # Split into documents
    documents = text_splitter.create_documents([text])
    return documents
