#!/usr/bin/env python3
"""
Cleanup Test Employee
Removes the test employee and resets the invite token for frontend testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from shared.database import get_db
from shared.models.employee import Employee
from shared.models.employer_employee import EmployerEmployee
from shared.models.invitetoken import InviteToken

def cleanup_test_employee():
    """Remove test employee and reset invite token"""
    print("🧹 Cleaning up test employee data...")
    print("=" * 50)
    
    db = next(get_db())
    
    try:
        # Find both test employees
        test_employees = db.query(Employee).filter(
            Employee.email.in_(["ayaz.test@kayasystems.com", "ayaz@kayasystems.com"])
        ).all()
        
        if test_employees:
            for test_employee in test_employees:
                print(f"👤 Found test employee: {test_employee.email} (ID: {test_employee.id})")
                
                # Delete employer-employee relationship
                employer_employee = db.query(EmployerEmployee).filter_by(employee_id=test_employee.id).first()
                if employer_employee:
                    print(f"🔗 Removing employer-employee relationship for {test_employee.email}...")
                    db.delete(employer_employee)
                
                # Delete the employee
                print(f"❌ Deleting employee record: {test_employee.email}...")
                db.delete(test_employee)
            
            print(f"✅ {len(test_employees)} test employee(s) deleted successfully!")
        else:
            print("ℹ️  No test employees found to delete")
        
        # Reset the invite token
        token = db.query(InviteToken).filter_by(token="ewCgv0ij664").first()
        if token:
            print(f"🎫 Found invite token: {token.token}")
            print(f"   - Currently used: {token.is_used}")
            
            # Reset the token
            token.is_used = False
            print("🔄 Resetting token to unused status...")
            
            print("✅ Invite token reset successfully!")
        else:
            print("ℹ️  Invite token not found")
        
        # Commit all changes
        db.commit()
        print("\n🎉 Cleanup completed successfully!")
        print("📝 You can now test frontend registration with:")
        print(f"   - Token: ewCgv0ij664")
        print(f"   - Email: ayaz.test@kayasystems.com (or any new email)")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {str(e)}")
        db.rollback()
    finally:
        db.close()

def verify_cleanup():
    """Verify the cleanup was successful"""
    print("\n🔍 Verifying cleanup...")
    print("=" * 30)
    
    db = next(get_db())
    
    try:
        # Check if employees are gone
        test_employees = db.query(Employee).filter(
            Employee.email.in_(["ayaz.test@kayasystems.com", "ayaz@kayasystems.com"])
        ).all()
        if test_employees:
            print(f"❌ {len(test_employees)} employee(s) still exist!")
            for emp in test_employees:
                print(f"   - {emp.email} (ID: {emp.id})")
        else:
            print("✅ All test employees successfully removed")
        
        # Check token status
        token = db.query(InviteToken).filter_by(token="ewCgv0ij664").first()
        if token:
            print(f"✅ Token status: {'Available' if not token.is_used else 'Used'}")
        else:
            print("❌ Token not found")
            
    except Exception as e:
        print(f"❌ Error during verification: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_test_employee()
    verify_cleanup()
