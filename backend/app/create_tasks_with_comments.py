#!/usr/bin/env python3
"""
Quick script to create sample tasks with comments for testing
"""
import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from shared.database import get_db
from shared.models.task import Task, TaskStatus, TaskPriority
from shared.models.task_comment import TaskComment
from shared.models.employer import Employer
from datetime import datetime, timedelta

def create_sample_tasks():
    db = next(get_db())
    
    # Get first employer
    employer = db.query(Employer).first()
    if not employer:
        print("No employer found. Please create an employer first.")
        return
    
    print(f"Creating tasks for employer: {employer.first_name} {employer.last_name}")
    
    # Create sample tasks
    tasks_data = [
        {
            "title": "Implement User Authentication",
            "description": "Set up JWT-based authentication system with login, register, and password reset functionality.",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.HIGH,
            "due_date": datetime.now() + timedelta(days=7)
        },
        {
            "title": "Design Database Schema",
            "description": "Create comprehensive database schema for the application with proper relationships and constraints.",
            "status": TaskStatus.PENDING,
            "priority": TaskPriority.MEDIUM,
            "due_date": datetime.now() + timedelta(days=14)
        },
        {
            "title": "Setup CI/CD Pipeline",
            "description": "Configure automated testing and deployment pipeline using GitHub Actions.",
            "status": TaskStatus.COMPLETED,
            "priority": TaskPriority.LOW,
            "due_date": datetime.now() + timedelta(days=21)
        }
    ]
    
    created_tasks = []
    
    for i, task_data in enumerate(tasks_data):
        # Create task
        task = Task(
            title=task_data["title"],
            description=task_data["description"],
            status=task_data["status"],
            priority=task_data["priority"],
            due_date=task_data["due_date"],
            employer_id=employer.id,
            created_by_id=employer.id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        created_tasks.append(task)
        
        print(f"Created task {task.id}: {task.title}")
        
        # Add sample comments to each task
        comments_data = [
            f"Started working on this task. Initial analysis looks good.",
            f"Made good progress today. About 30% complete.",
            f"Need to discuss some technical details with the team."
        ]
        
        for j, comment_content in enumerate(comments_data):
            comment = TaskComment(
                content=comment_content,
                task_id=task.id,
                author_id=employer.id,
                created_at=datetime.now() - timedelta(hours=24-j*8),
                updated_at=datetime.now() - timedelta(hours=24-j*8)
            )
            
            db.add(comment)
        
        db.commit()
        print(f"  Added {len(comments_data)} comments to task {task.id}")
    
    print(f"\n✅ Created {len(created_tasks)} tasks with comments!")
    print("Task IDs:", [task.id for task in created_tasks])
    
    db.close()

if __name__ == "__main__":
    create_sample_tasks()
