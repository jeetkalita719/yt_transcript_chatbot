from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

def get_answer(query, context):
    """
    Generate an answer based on the query and retrieved context.
    
    Args:
        query: User's question
        context: Retrieved context from the transcript
    
    Returns:
        Generated answer string
    """
    # Check if context is empty or too short
    if not context or len(context.strip()) < 50:
        return "I'm sorry, I couldn't retrieve enough information from the video transcript to answer your question. Please try rephrasing your question or ask about a different aspect of the video."
    
    llm = ChatOpenAI(temperature=0)
    
    # Detect if this is a summary request
    query_lower = query.lower()
    is_summary_request = any(word in query_lower for word in ['summary', 'summarize', 'overview', 'what is this video about', 'what does this video'])
    
    if is_summary_request:
        # Better prompt for summary requests
        prompt = ChatPromptTemplate.from_template(
            """You are a helpful assistant that provides summaries and answers questions about YouTube video transcripts.

Context from video transcript:
{context}

User question: {query}

Instructions:
- Provide a comprehensive and informative answer based on the context provided
- For summary requests, synthesize the main points, topics, and key information from the transcript
- Be thorough and include important details
- Use a clear, engaging writing style
- If the context doesn't contain enough information, explain what you can determine from what's available

Answer:"""
        )
    else:
        # Standard prompt for specific questions
        prompt = ChatPromptTemplate.from_template(
            """You are a helpful assistant that answers questions about YouTube video transcripts.

Context from video transcript:
{context}

User question: {query}

Instructions:
- Answer the question based on the information provided in the context
- Be accurate and specific
- If the context contains relevant information, provide a detailed answer
- If the context doesn't contain enough information to fully answer, explain what you can determine from what's available
- Use a friendly, conversational tone

Answer:"""
        )
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({"context": context, "query": query})
        return response.content
    except Exception as e:
        return f"I encountered an error while processing your question. Please try again. Error: {str(e)}"
