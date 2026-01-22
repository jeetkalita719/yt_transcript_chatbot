"""Module for creating and using retrievers."""
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import LLMChainExtractor
from typing import List, Optional
from config import app_config
from llm_factory import LLMFactory


class RetrieverFactory:
    """Factory for creating retrievers (SRP: Single responsibility)."""
    
    def __init__(self, llm_factory=None):
        """Initialize with optional LLM factory (DIP: Dependency injection)."""
        self.llm_factory = llm_factory or LLMFactory
    
    def create_compressed_retriever(self, vector_store, k: Optional[int] = None):
        """Create a compressed retriever with contextual compression."""
        k = k or app_config.retrieval_k
        base_retriever = vector_store.as_retriever(search_kwargs={"k": k})
        
        llm = self.llm_factory.create_chat_llm()
        compressor = LLMChainExtractor.from_llm(llm)
        
        return ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=base_retriever
        )


class ContextRetriever:
    """Handles context retrieval from compressed retriever (SRP: Single responsibility)."""
    
    @staticmethod
    def get_context(query: str, compressed_retriever) -> str:
        """Retrieve and format context from compressed retriever."""
        docs = compressed_retriever.invoke(query)
        return "\n\n".join([doc.page_content for doc in docs])


def create_compressed_retriever(vector_store, k: Optional[int] = None):
    """Convenience function for backward compatibility."""
    factory = RetrieverFactory()
    return factory.create_compressed_retriever(vector_store, k)


def get_context(query: str, compressed_retriever) -> str:
    """Convenience function for backward compatibility."""
    return ContextRetriever.get_context(query, compressed_retriever)
