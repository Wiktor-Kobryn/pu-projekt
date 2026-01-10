from pydantic import BaseModel

class TekstResponse(BaseModel):
    id: int
    nazwa: str
    tresc: str

    class Config:
        orm_mode = True

class TekstRequest(BaseModel):
    nazwa: str
    tresc: str

class WpisResponse(BaseModel):
    id: int
    rola: str
    tresc: str

    class Config:
        orm_mode = True

class WpisRequest(BaseModel):
    tekst_id: int
    rola: str # user / assistant
    tresc: str

class AiStatelessRequest(BaseModel):
    polecenie: str # streść / wytłumacz prościej / przetłumacz na język XYZ
    tekst: str

class AiQuizRequest(BaseModel):
    ilosc_pytan: int

class AiTextRequest(BaseModel):
    zapytanie: str # pełne zapytanie

class AiTextResponse(BaseModel):
    tekst: str

from pydantic import BaseModel
from typing import List

class Odpowiedz(BaseModel):
    odp: str

class Pytanie(BaseModel):
    tresc: str
    indeks_poprawnej: int
    odpowiedzi: List[Odpowiedz]

class AiQuizResponse(BaseModel):
    pytania: List[Pytanie]
