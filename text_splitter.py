from langchain_text_splitters import RecursiveCharacterTextSplitter

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
