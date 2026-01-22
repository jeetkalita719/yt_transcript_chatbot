from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import LLMChainExtractor
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

def create_compressed_retriever(vector_store, k=5):
    # Base retriever
    base_retriever = vector_store.as_retriever(search_kwargs={"k": k})
    
    # LLM for compression
    llm = ChatOpenAI(temperature=0)
    
    # Compressor
    compressor = LLMChainExtractor.from_llm(llm)
    
    # Compressed retriever
    compressed_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=base_retriever
    )
    
    return compressed_retriever

def get_context(query, compressed_retriever):
    docs = compressed_retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])
    return context