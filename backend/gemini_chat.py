import google.generativeai as genai
from model import Wpis, Tekst

genai.configure(api_key="AIzaSyDvw4mV0j6SUQZpG6Jw27sFXta75SEhLRM")

def ask_gemini_stateless(zapytanie: str) -> str:
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=(
            "Dostając zadanie streszczenia/wyjaśnienia/tłumaczenia tekstu lub jego fragmentu zwracaj wyłącznie jego wynik, bez markdown."
            "Na pytania odpowiadaj w języku polskim"
        )
    )

    response = model.generate_content(zapytanie)
    return response.text

def ask_gemini_stateful(zapytanie: str, tekst_analizy: Tekst, historia: list[Wpis]) -> str:
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=(
            "Odpowiadaj na pytania krótko i zwięźle, w języku polskim."
            f"Odpowiadaj na podstawie podanego tekstu jeżeli to możliwe: '{tekst_analizy.tresc}'."
        )
    )

    contents = []
    for wpis in historia:
        contents.append({
            "role": wpis.rola,  
            "parts": [wpis.tresc]
        })

    contents.append({
        "role": "user",
        "parts": [zapytanie]
    })

    response = model.generate_content(contents)
    return response.text
