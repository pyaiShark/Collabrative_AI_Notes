import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
# This requires GROQ_API_KEY to be set in the environment or .env file
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_note_metadata(body: str) -> dict:
    """
    Calls the Groq API to generate a summary, action items, and a title based on the note body.
    """
    if not body or not body.strip():
        return {
            "summary": "",
            "action_items": [],
            "suggested_title": ""
        }

    system_prompt = """
You are an AI assistant that analyzes meeting notes or raw text.
You must return a JSON object with EXACTLY the following structure. You should use rich Markdown formatting (like **bold**, *italics*, and `code blocks`) within the summary and action items to make them highly readable.
{
  "summary": "A 1-2 sentence summary of the note using markdown.",
  "action_items": ["Action 1 with **markdown**", "Action 2"],
  "suggested_title": "A short, relevant title (plain text)"
}
"""
    
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the note content:\n\n{body}"}
            ],
            temperature=0.3,
            max_tokens=512,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {
            "summary": "Could not generate summary.",
            "action_items": [],
            "suggested_title": "Untitled Note"
        }
