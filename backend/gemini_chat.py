import google.generativeai as genai
from model import Wpis, Tekst
import json
import re

# NIE COMMITOWAĆ ODKOMENTOWANEGO BŁAGAM
#
# genai.configure(api_key="AIzaSyArTpV-k6R8lDD
# yJzSsmHj3Fw6LXadLgGk")

genai.configure(api_key="klucz-klucz")

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

def ask_gemini_generate_quiz(ilosc_pytan: int, tekst_analizy: Tekst) -> dict:
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=f"""
        ZWRACAJ WYŁĄCZNIE POPRAWNY JSON.
        NIE używaj markdown.
        NIE używaj ```json.
        NIE dodawaj komentarzy.
        NIE dodawaj żadnego tekstu poza JSON.

        FORMAT (DOKŁADNIE TAKA STRUKTURA):
        {{"pytania":[{{"tresc":"...","indeks_poprawnej":0,"odpowiedzi":[{{"odp":"..."}},{{"odp":"..."}},{{"odp":"..."}}]}}]}}

        ZASADY:
        - Dokładnie {ilosc_pytan} pytań
        - Zawsze 3 odpowiedzi
        - Tylko 1 poprawna
        - indeks_poprawnej: 0, 1 albo 2
        - Pytania WYŁĄCZNIE na podstawie tekstu poniżej

        TEKST:
        "{tekst_analizy.tresc}"
        """
    )

    response = model.generate_content(
        f"Wygeneruj quiz z {ilosc_pytan} pytaniami."
    )

    return parse_quiz_response(response.text)

# POMOCNICZE FUNKCJE

def extract_json(text: str) -> str:
    text = text.strip()

    # usuń markdown ```json ... ```
    if text.startswith("```"):
        text = re.sub(r"^```json\s*|\s*```$", "", text, flags=re.DOTALL)

    # wytnij od pierwszej { do ostatniej }
    start = text.find("{")
    end = text.rfind("}") + 1

    if start == -1 or end == -1:
        raise ValueError("Nie znaleziono poprawnego JSON w odpowiedzi modelu")

    return text[start:end]

def parse_quiz_response(text: str) -> dict:
    clean_json = extract_json(text)
    return json.loads(clean_json)
