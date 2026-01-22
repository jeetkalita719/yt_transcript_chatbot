from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

def get_answer(query, context):
    llm = ChatOpenAI(temperature=0)
    
    prompt = ChatPromptTemplate.from_template(
        """Use the following context to answer the question. 
        If you don't know the answer, say you don't know.
        
        Context: {context}
        
        Question: {query}
        
        Answer:"""
    )
    
    chain = prompt | llm
    
    response = chain.invoke({"context": context, "query": query})
    return response.content
