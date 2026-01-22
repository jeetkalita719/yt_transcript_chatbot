"""Module for generating answers using LLM."""
from langchain_core.prompts import ChatPromptTemplate
from typing import Optional
from llm_factory import LLMFactory


class AnswerGenerator:
    """Generates answers using LLM (SRP: Single responsibility)."""
    
    PROMPT_TEMPLATE = """Use the following context to answer the question. 
    If you don't know the answer, say you don't know.
    
    Context: {context}
    
    Question: {query}
    
    Answer:"""
    
    def __init__(self, llm_factory=None, prompt_template: Optional[str] = None):
        """Initialize with optional LLM factory and prompt (DIP: Dependency injection)."""
        self.llm_factory = llm_factory or LLMFactory
        self.prompt_template = prompt_template or self.PROMPT_TEMPLATE
        self._prompt = ChatPromptTemplate.from_template(self.prompt_template)
        self._llm = None
    
    def _get_llm(self):
        """Lazy initialization of LLM (DRY: avoid repeated instantiation)."""
        if self._llm is None:
            self._llm = self.llm_factory.create_chat_llm()
        return self._llm
    
    def generate(self, query: str, context: str) -> str:
        """Generate answer from query and context."""
        llm = self._get_llm()
        chain = self._prompt | llm
        response = chain.invoke({"context": context, "query": query})
        return response.content


def get_answer(query: str, context: str) -> str:
    """Convenience function for backward compatibility."""
    generator = AnswerGenerator()
    return generator.generate(query, context)
