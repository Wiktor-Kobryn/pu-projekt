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
    rola: str
    tresc: str

class AiCommunicationRequest:
    polecenie: str # streść / wytłumacz prościej / przetłumacz na język XYZ
    tekst: str

class AiCommunicationResponce:
    tekst: str
