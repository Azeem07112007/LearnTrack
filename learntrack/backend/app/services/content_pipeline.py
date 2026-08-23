import os
import json
from groq import Groq
from paddleocr import PaddleOCR

groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])
print("DEBUG GROQ KEY:", repr(os.environ.get("GROQ_API_KEY")))
import pytesseract
from pdf2image import convert_from_path

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\Users\Azeem\Downloads\Release-26.02.0-0\poppler-26.02.0\Library\bin"  # update to your actual extracted path

QUIZ_PROMPT = """You are a quiz generator for school students.
Given the following text, generate 5 multiple-choice questions.
Return ONLY valid JSON, no markdown fences, in this exact format:
[
  {{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "B", "difficulty": "easy"}}
]

Text:
{chunk}
"""

def extract_text(file_path: str) -> str:
    if file_path.lower().endswith(".pdf"):
        pages = convert_from_path(file_path, poppler_path=POPPLER_PATH)
        text = "\n".join(pytesseract.image_to_string(page) for page in pages)
    else:
        from PIL import Image
        text = pytesseract.image_to_string(Image.open(file_path))
    return text



def chunk_text(text: str, chunk_size: int = 400) -> list[str]:
    words = text.split()
    return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]


def generate_questions_for_chunk(chunk: str) -> list[dict]:
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": QUIZ_PROMPT.format(chunk=chunk)}],
        temperature=0.4,
    )
    raw = response.choices[0].message.content.strip()
    raw = raw.removeprefix("```json").removesuffix("```").strip()
    try:
        questions = json.loads(raw)
        for q in questions:
            letter = q.get("correct_answer", "").strip().upper()
            if letter in "ABCD":
                idx = "ABCD".index(letter)
                if idx < len(q["options"]):
                    q["correct_answer"] = q["options"][idx]
        return questions
    except json.JSONDecodeError:
        return []


def generate_quiz_from_file(file_path: str) -> list[dict]:
    text = extract_text(file_path)
    chunks = chunk_text(text)
    all_questions = []
    for chunk in chunks:
        all_questions.extend(generate_questions_for_chunk(chunk))
    return all_questions
