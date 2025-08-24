#!/usr/bin/env python3
"""
Check Invite Token Status
Validates if the provided token exists and is valid
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from shared.database import get_db
from shared.models.invitetoken import InviteToken
from datetime import datetime

def check_token_status(token_value):
    """Check the status of an invite token"""
    print(f"🔍 Checking token: {token_value}")
    print("=" * 50)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Find the token
        token = db.query(InviteToken).filter_by(token=token_value).first()
        
        if not token:
            print("❌ Token not found in database")
            return False
            
        print(f"✅ Token found!")
        print(f"📊 Token Details:")
        print(f"   - ID: {token.id}")
        print(f"   - Token: {token.token}")
        print(f"   - Employer ID: {token.employer_id}")
        print(f"   - Is Used: {token.is_used}")
        print(f"   - Expires At: {token.expires_at}")
        print(f"   - Current Time: {datetime.utcnow()}")
        
        # Check if token is valid
        if token.is_used:
            print("❌ Token has already been used")
            return False
            
        if token.expires_at and token.expires_at < datetime.utcnow():
            print("❌ Token has expired")
            return False
            
        print("✅ Token is valid and can be used!")
        return True
        
    except Exception as e:
        print(f"❌ Error checking token: {str(e)}")
        return False
    finally:
        db.close()

def list_all_tokens():
    """List all invite tokens in the database"""
    print("\n🎫 All Invite Tokens in Database:")
    print("=" * 50)
    
    db = next(get_db())
    
    try:
        tokens = db.query(InviteToken).all()
        
        if not tokens:
            print("❌ No invite tokens found in database")
            return
            
        for token in tokens:
            status = "✅ Valid"
            if token.is_used:
                status = "❌ Used"
            elif token.expires_at and token.expires_at < datetime.utcnow():
                status = "⏰ Expired"
                
            print(f"Token: {token.token}")
            print(f"  - Employer ID: {token.employer_id}")
            print(f"  - Status: {status}")
            print(f"  - Expires: {token.expires_at}")
            print()
            
    except Exception as e:
        print(f"❌ Error listing tokens: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    # Check the specific token
    token_to_check = "LMkrLPnv3NU"
    check_token_status(token_to_check)
    
    # List all tokens for reference
    list_all_tokens()
