from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from typing import List
from pydantic import ConfigDict, Field
from dotenv import load_dotenv

load_dotenv()

# Try to import EnsembleRetriever, fallback to custom implementation if not available
try:
    from langchain_community.retrievers import EnsembleRetriever
    ENSEMBLE_AVAILABLE = True
except ImportError:
    try:
        from langchain_classic.retrievers import EnsembleRetriever
        ENSEMBLE_AVAILABLE = True
    except ImportError:
        ENSEMBLE_AVAILABLE = False


class HybridRetriever(BaseRetriever):
    """
    Custom hybrid retriever that combines BM25 and vector search.
    Used as fallback if EnsembleRetriever is not available.
    """
    model_config = ConfigDict(arbitrary_types_allowed=True)

    bm25_retriever: BaseRetriever
    vector_retriever: BaseRetriever
    weights: List[float] = Field(default_factory=lambda: [0.4, 0.6])  # 40% BM25, 60% vector
    k: int = 5
    
    def _get_relevant_documents(self, query: str) -> List[Document]:
        """Retrieve documents using both retrievers and combine results."""
        # Get results from both retrievers
        bm25_docs = self.bm25_retriever.invoke(query)
        vector_docs = self.vector_retriever.invoke(query)
        
        # Combine and deduplicate based on content
        seen_content = set()
        combined_docs = []
        doc_scores = {}
        
        # Add BM25 results with weight
        for doc in bm25_docs:
            content = doc.page_content
            if content not in seen_content:
                seen_content.add(content)
                doc_scores[content] = self.weights[0]
                combined_docs.append(doc)
        
        # Add vector results with weight, merge scores if duplicate
        for doc in vector_docs:
            content = doc.page_content
            if content in seen_content:
                doc_scores[content] += self.weights[1]
            else:
                seen_content.add(content)
                doc_scores[content] = self.weights[1]
                combined_docs.append(doc)
        
        # Sort by combined score (descending)
        combined_docs.sort(key=lambda d: doc_scores.get(d.page_content, 0), reverse=True)
        
        # Return top k documents
        return combined_docs[:self.k]


def create_compressed_retriever(vector_store, chunks=None, k=5):
    """
    Creates a hybrid retriever combining BM25 (keyword) and vector (semantic) search.
    
    Args:
        vector_store: FAISS vector store for semantic search
        chunks: List of text chunks (optional, for BM25). If None, uses vector-only.
        k: Number of documents to retrieve
    
    Returns:
        Ensemble retriever combining BM25 and vector search
    """
    # Vector retriever for semantic search
    vector_retriever = vector_store.as_retriever(search_kwargs={"k": k})
    
    # If chunks are provided, create hybrid search
    if chunks:
        # Convert chunks to Document objects for BM25
        documents = [Document(page_content=chunk) for chunk in chunks]
        
        # BM25 retriever for keyword matching
        bm25_retriever = BM25Retriever.from_documents(documents)
        bm25_retriever.k = k
        
        # Use EnsembleRetriever if available, otherwise use custom HybridRetriever
        if ENSEMBLE_AVAILABLE:
            ensemble_retriever = EnsembleRetriever(
                retrievers=[bm25_retriever, vector_retriever],
                weights=[0.4, 0.6]  # 40% keyword matching, 60% semantic search
            )
            return ensemble_retriever
        else:
            # Fallback to custom hybrid retriever
            return HybridRetriever(
                bm25_retriever=bm25_retriever,
                vector_retriever=vector_retriever,
                weights=[0.4, 0.6],
                k=k
            )
    else:
        # Fallback to vector-only if chunks not provided
        return vector_retriever

def get_context(query, retriever):
    """
    Retrieves relevant context documents for a query.
    
    Args:
        query: User's question
        retriever: Retriever instance (hybrid or vector)
    
    Returns:
        Combined context string from retrieved documents
    """
    docs = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])
    return context