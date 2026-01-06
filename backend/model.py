from sqlalchemy import ( Column, Integer, String, Text, ForeignKey )
from sqlalchemy.orm import ( DeclarativeBase, relationship )

class Base(DeclarativeBase):
    pass

class Tekst(Base):
    __tablename__ = "Teksty"

    id = Column(Integer, primary_key=True)
    nazwa = Column(String(255), nullable=False)
    tresc = Column(Text, nullable=False)

    wpisy = relationship("Wpis", back_populates="tekst", cascade="all, delete-orphan") # 1-N


class Wpis(Base):
    __tablename__ = "Wpisy"

    id = Column(Integer, primary_key=True)
    tekst_id = Column(Integer, ForeignKey("Teksty.id", ondelete="CASCADE"), nullable=False)
    rola = Column(String(100), nullable=False)
    tresc = Column(Text, nullable=False)

    tekst = relationship("Tekst", back_populates="wpisy") # N-1
