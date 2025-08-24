from shared.database import engine, Base

# Import all models to register them with SQLAlchemy
from shared.models import (
    admin,
    coworkingspacelisting,
    booking,
    employee,
    employer,
    attendance,
    invitetoken,
    employer_employee,
    task,
    task_assignment,
    task_comment,
    password_reset_token
)

print("[*] Creating database tables...")
Base.metadata.create_all(bind=engine)
print("[✓] Tables created.")
