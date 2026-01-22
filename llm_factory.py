"""Factory for creating LLM instances (DRY: Don't repeat yourself)."""
from langchain_openai import ChatOpenAI
from typing import Optional
from config import app_config


class LLMFactory:
    """Factory for creating LLM instances (SRP: Single responsibility)."""
    
    @staticmethod
    def create_chat_llm(temperature: Optional[float] = None) -> ChatOpenAI:
        """Create a ChatOpenAI instance with consistent configuration."""
        return ChatOpenAI(temperature=temperature or app_config.llm_temperature)
    
    @staticmethod
    def create_embeddings():
        """Create OpenAI embeddings instance."""
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings()

