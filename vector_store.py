"""Module for creating vector stores."""
from langchain_community.vectorstores import FAISS
from typing import List
from llm_factory import LLMFactory


class VectorStoreFactory:
    """Factory for creating vector stores (SRP: Single responsibility)."""
    
    def __init__(self, embeddings_factory=None):
        """Initialize with optional embeddings factory (DIP: Dependency injection)."""
        self.embeddings_factory = embeddings_factory or LLMFactory
    
    def create(self, chunks: List[str]):
        """Create a FAISS vector store from text chunks."""
        embeddings = self.embeddings_factory.create_embeddings()
        return FAISS.from_texts(chunks, embeddings)


def create_vector_store(chunks: List[str]):
    """Convenience function for backward compatibility."""
    factory = VectorStoreFactory()
    return factory.create(chunks)
