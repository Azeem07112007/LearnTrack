import os
from groq import Groq
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.db import supabase

groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM_PROMPT = """You are a friendly study helper for a school student.
Answer ONLY using the material excerpts provided below — they were retrieved
because they're the most relevant to the student's question. If they don't
actually cover the question, say so honestly and suggest they ask their
teacher — do not make up facts. Keep answers short, clear, and encouraging.
Use simple language suitable for a school student.

--- RELEVANT MATERIAL ---
{context}
--- END MATERIAL ---
"""

CHUNK_WORDS = 150
TOP_K = 4
MIN_SIMILARITY = 0.05  # below this, treat as "no relevant match"


def chunk_text(text: str, title: str, domain: str) -> list[dict]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), CHUNK_WORDS):
        piece = " ".join(words[i:i + CHUNK_WORDS])
        if piece.strip():
            chunks.append({"text": piece, "title": title, "domain": domain})
    return chunks


def build_corpus(class_id: str, domain: str | None = None) -> list[dict]:
    query = supabase.table("content").select("title, raw_text, domain").eq("class_id", class_id)
    if domain:
        query = query.eq("domain", domain)
    rows = query.execute().data

    corpus = []
    for row in rows:
        corpus.extend(chunk_text(row.get("raw_text") or "", row["title"], row["domain"]))
    return corpus


def retrieve_relevant_chunks(question: str, corpus: list[dict]) -> list[dict]:
    """Real vector-space retrieval: TF-IDF + cosine similarity, ranked per question --
    not just 'most recently uploaded'."""
    if not corpus:
        return []

    texts = [c["text"] for c in corpus] + [question]
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(texts)

    question_vec = matrix[-1]
    chunk_vecs = matrix[:-1]
    scores = cosine_similarity(question_vec, chunk_vecs)[0]

    ranked = sorted(zip(scores, corpus), key=lambda x: x[0], reverse=True)
    return [chunk for score, chunk in ranked[:TOP_K] if score >= MIN_SIMILARITY]


def answer_question(class_id: str, question: str, domain: str | None = None) -> str:
    corpus = build_corpus(class_id, domain)
    if not corpus:
        return "Your teacher hasn't uploaded any material yet, so I don't have anything to answer from. Try asking your teacher directly!"

    relevant = retrieve_relevant_chunks(question, corpus)
    if not relevant:
        return "I couldn't find anything in your class material that covers this -- try rephrasing, or ask your teacher directly."

    context = "\n\n".join(f"[{c['domain']} - {c['title']}]\n{c['text']}" for c in relevant)

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT.format(context=context)},
            {"role": "user", "content": question},
        ],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()
