from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
from model import *
from schemas import TekstRequest, TekstResponse, WpisRequest, WpisResponse
from database import SessionLocal, engine, Base

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