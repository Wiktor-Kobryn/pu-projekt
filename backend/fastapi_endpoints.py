from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
from model import *
from schemas import TekstRequest, TekstResponse, WpisRequest, WpisResponse, AiStatelessRequest, AiTextResponse, AiTextRequest
from database import SessionLocal, engine, Base
from gemini_chat import *

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NaukaAI API")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# TEKSTY - GET ALL
@app.get("/teksty", response_model=List[TekstResponse])
def get_all_tekst(db: Session = Depends(get_db)):
    return db.query(Tekst).all()

# TEKSTY - GET SINGLE
@app.get("/teksty/{id}", response_model=TekstResponse)
def get_single_tekst(id: int, db: Session = Depends(get_db)):
    tekst = db.query(Tekst).filter(Tekst.id == id).first()
    if not tekst:
        raise HTTPException(404, "Nie znaleziono tekstu")
    return tekst

# TEKSTY - CREATE
@app.post("/teksty", response_model=TekstResponse)
def add_tekst(data: TekstRequest, db: Session = Depends(get_db)):
    nowy_tekst = Tekst(**data.dict())
    db.add(nowy_tekst)
    db.commit()
    return nowy_tekst

# TEKSTY - DELETE
@app.delete("/teksty/{id}")
def delete_tekst(id: int, db: Session = Depends(get_db)):
    usuwany_tekst = db.query(Tekst).filter(Tekst.id == id).first()
    if not usuwany_tekst:
        raise HTTPException(404, "Nie znaleziono tekstu")
    
    db.delete(usuwany_tekst)
    db.commit()
    return {"message": "Poprawnie usunięto tekst"}

# WPISY - GET ALL BY TEKST ID
@app.get("/wpisy/{tekstId}", response_model=List[WpisResponse])
def get_all_by_tekst(tekstId: int, db: Session = Depends(get_db)):
    wpisy = db.query(Wpis).filter(Wpis.tekst_id == tekstId).all()
    return wpisy

# WPISY - CREATE
@app.post("/wpisy", response_model=WpisResponse)
def add_wpis(data: WpisRequest, db: Session = Depends(get_db)):
    nowy_wpis = Wpis(**data.dict())
    db.add(nowy_wpis)
    db.commit()
    return nowy_wpis

# WPISY - DELETE ALL BY TEKST ID
@app.delete("/tekst/{tekstId}/wpisy")
def delete_all_wpisy_by_tekst(tekstId: int, db: Session = Depends(get_db)):
    tekst = db.query(Tekst).filter(Tekst.id == tekstId).first()
    if not tekst:
        raise HTTPException(404, "Nie znaleziono tekstu")

    db.query(Wpis).filter(Wpis.tekst_id == tekstId).delete(synchronize_session=False)
    db.commit()

    return { "message": "Poprawnie usunięto wpisy" }


# AI REQUEST - STATELESS
@app.post("/ai-stateless", response_model=AiTextResponse)
def ask_ai_stateless(data: AiStatelessRequest):
    zapytanie = f"{data.polecenie} podany fragment tekstu: '{data.tekst}'"
    odpowiedz = ask_gemini_stateless(zapytanie)
    return AiTextResponse(tekst=odpowiedz)

# AI REQUEST - STATEFUL
@app.post("/ai-stateful/{tekstId}", response_model=AiTextResponse)
def ask_ai_stateful(tekstId: int, data: AiTextRequest, db: Session = Depends(get_db)):
    # pobranie kontekstu rozmowy dla danego tekstu
    wpisy = db.query(Wpis).filter(Wpis.tekst_id == tekstId).order_by(Wpis.id).all()
    tekst = db.query(Tekst).filter(Tekst.id == tekstId).first()
    if not tekst:
        raise HTTPException(404, "Nie znaleziono tekstu")

    # chat z gemini z kontekstem
    odpowiedz = ask_gemini_stateful(data.zapytanie, tekst, wpisy)
    
    # zapis rozmowy w bazie
    db.add(Wpis(tekst_id=tekstId, rola="user", tresc=data.zapytanie))
    db.add(Wpis(tekst_id=tekstId, rola="model", tresc=odpowiedz))
    db.commit()

    return AiTextResponse(tekst=odpowiedz)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# commands:
#
# alembic upgrade head
# uvicorn fastapi_endpoints:app --reload
# http://127.0.0.1:8000/docs#/