# app/create_admin.py
from shared.database import SessionLocal
from shared.models.admin import Admin
from app.auth import hash_password

db = SessionLocal()

admin = Admin(
    username="admin",
    password_hash=hash_password("admin")  # 🔐 Change if needed
)

db.add(admin)
db.commit()
print("Admin user created.")
