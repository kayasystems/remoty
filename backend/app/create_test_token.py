from datetime import datetime, timedelta
from shared.database import SessionLocal
from shared.models.invitetoken import InviteToken

db = SessionLocal()

new_token = InviteToken(
    token="abcd1234",
    employer_id=1,  # make sure employer with ID 1 exists
    is_used=False,
    expires_at=datetime.utcnow() + timedelta(days=7)
)

db.add(new_token)
db.commit()
db.close()

print("✅ Test invite token inserted.")
