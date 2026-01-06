from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

# database - 'NaukaAiDB'
connection_string = "mssql+pyodbc://@(localdb)\MSSQLLocalDB/NaukaAiDB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
engine = create_engine(connection_string)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
