# YouTube Transcript RAG Chatbot

A simple RAG (Retrieval-Augmented Generation) chatbot that can read YouTube video transcripts and answer questions about the video content.

## Features

- Extract transcripts from YouTube videos using video URL or ID
- Split transcripts into chunks for efficient processing
- Create vector embeddings using OpenAI
- Store embeddings in FAISS vector store
- Contextual compression for relevant document retrieval
- Answer questions using LangChain and OpenAI

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jeetkalita719/yt_transcript_chatbot.git
cd yt_transcript_chatbot
```

2. Create a virtual environment:
```bash
python -m venv myvenv
```

3. Activate the virtual environment:
- Windows: `myvenv\Scripts\activate`
- Linux/Mac: `source myvenv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Usage

Run the main script:
```bash
python main.py
```

1. Enter a YouTube video URL or ID when prompted
2. Wait for the transcript to be loaded and processed
3. Ask questions about the video content
4. Type 'quit' to exit

## Project Structure

- `main.py` - Main entry point
- `transcript_loader.py` - Loads YouTube transcripts
- `text_splitter.py` - Splits transcripts into chunks
- `vector_store.py` - Creates FAISS vector store
- `retriever.py` - Implements contextual compression retriever
- `chatbot.py` - Generates answers using LLM

## Requirements

- Python 3.10+
- OpenAI API key
- Internet connection for fetching YouTube transcripts

## License

MIT

