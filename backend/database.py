from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# KONEKSI KE MYSQL PORT 3307
DATABASE_URL = "mysql+pymysql://root:@localhost:3307/cp_insight"

# BUAT KONEKSI
engine = create_engine(DATABASE_URL, pool_pre_ping=True, echo=False)

# BUAT SESSION BIAR BISA QUERY
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# BUAT BASE UNTUK MODEL TABEL
Base = declarative_base()

# FUNGSI BUAT DIPANGGIL DI app.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()