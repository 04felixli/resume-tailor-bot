import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # Loads variables from .env

API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI()

def build_prompt(parsed_JD, top_items):
    jd_text = "\n".join(parsed_JD.get("requirements", []))

    items_text = []
    for item in top_items:
        items_text.append({
            "id": item.id,
            "type": item.type,
            "company": item.company,
            "role": item.role,
            "name": item.name,
            "start": item.start,
            "end": item.end,
            "bullets": item.bullets
        })

    return f"""
            This GPT is a highly skilled resume builder focused on crafting professional, concise, and impactful resumes using the XYZ format (accomplished X by doing Y, resulting in Z). It generates clear, 
            compelling bullet points that highlight achievements, optimizes structure for readability, and ensures alignment with industry best practices. Emphasis is placed on showcasing the impact of each action, 
            quantifying results whenever possible. Responses will be tailored to different experience levels, technical stacks, and job roles, while maintaining a formal and professional tone. 

            Job Requirements:
            {jd_text}

            Candidate's Experiences (JSON structure):
            {items_text}

            Task:
            - Rewrite ONLY the bullet texts.
            - Keep the same order of experiences and the same order of bullets within each experience.
            - Return the result as valid JSON with the schema shown above.
            """

def rewrite_bullets(parsed_JD, top_items):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert career coach."},
            {"role": "user", "content": build_prompt(parsed_JD, top_items)},
        ],
        temperature=0.5,
        response_format={"type": "json_object"} 
    )

    print("OpenAI API response:", response)
    # rewritten_json = response.choices[0].message.content
    # return rewritten_json