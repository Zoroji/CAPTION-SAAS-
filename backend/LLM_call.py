import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
client = Groq(api_key=os.getenv("groq_api"))

PROMPT_TEMPLATE = """The above image is posted by a user who wants to find the best caption for this image.

Step-by-step instructions:
1. What mood or emotion did the user have before posting this generally?
2. What is the location of this image, what was the user activity just before that, and where was he (imagine a story)?
3. Here are 50 human-written captions from visually similar images (ordered by similarity score) to assist you:
{similar_results}
4. Select and adapt from the 50 reference captions in Step 3 as direct starting templates to build 10 final captions that fit the image using the mood and story from steps 1-2. Do NOT invent brand-new captions from scratch—use the provided human captions as your foundation and modify them.
5. Add Urban Dictionary Gen Z slang naturally to at least 5 of the 10 captions.
6. Recheck all 10 captions against the uploaded image: modify any caption that does not fit the image, and keep it if it matches. 
7. Avoid overlong captions, avoid emojis.

Output Format:
Return your response STRICTLY as a single valid JSON object:
{{
  "captions": [
    "caption 1",
    "caption 2",
    "caption 3",
    "caption 4",
    "caption 5",
    "caption 6",
    "caption 7",
    "caption 8",
    "caption 9",
    "caption 10"
  ],
  "reasoning": "Short step-by-step reasoning covering steps 1 through 5."
}}
"""


def calling_LLM(img_base64: str, similar_results: list) -> str:
    formatted_results = "\n".join(
        [f"{i+1}. [Similarity: {item['score']:.6f}] | Caption: \"{item['caption']}\"" for i, item in enumerate(similar_results)]
    )
    prompt = PROMPT_TEMPLATE.format(similar_results=formatted_results)

    response = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}}
                ]
            }
        ]
    )

    return response.choices[0].message.content
