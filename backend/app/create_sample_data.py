import random
import json
from datetime import datetime, timedelta, time
from shared.database import SessionLocal
from app.auth import hash_password
from app.utils.geocode import geocode_address, calculate_distance_km
from shared.models import (
    admin as admin_model,
    employer as employer_model,
    employee as employee_model,
    employer_employee as employer_employee_model,
    coworkingspacelisting as coworking_model,
    coworking_images as coworking_images_model,
    attendance as attendance_model,
    invitetoken as token_model,
    booking as booking_model,
    task as task_model,
    task_assignment as task_assignment_model,
    task_comment as task_comment_model,
    notification as notification_model
)

db = SessionLocal()

# Clear existing data
db.query(task_comment_model.TaskComment).delete()
db.query(task_assignment_model.TaskAssignment).delete()
db.query(task_model.Task).delete()
db.query(attendance_model.Attendance).delete()
db.query(booking_model.CoworkingBooking).delete()
db.query(employer_employee_model.EmployerEmployee).delete()
db.query(employee_model.Employee).delete()
db.query(token_model.InviteToken).delete()
db.query(employer_model.Employer).delete()
db.query(coworking_model.CoworkingSpaceListing).delete()
db.query(admin_model.Admin).delete()
db.commit()

# Create Admin
admin = admin_model.Admin(
    username="admin@test.com",
    password_hash=hash_password("admin")
)
db.add(admin)

# Create Employer
employer = employer_model.Employer(
    first_name="Test",
    last_name="Employer",
    email="employer@test.com",
    password_hash=hash_password("admin1"),
    address="123 Business St, Lahore, Pakistan",
    city="Lahore",
    zip_code="54000",
    country="Pakistan",
    state="Punjab",
    latitude=31.5204,
    longitude=74.3587,
    timezone="Asia/Karachi",
    phone_number="+92-300-1234567",
    company_name="Test Company Ltd"
)
db.add(employer)
db.flush()

# Real address data (for employees + coworking spaces)
address_data = {     
    "Pakistan": {
        "city": "Lahore",
        "employee_addresses": [
            "House 22, Jail Road, Lahore, Pakistan",
            "House 15, Street 3, Gulberg III, Lahore, Pakistan",
            "42-A, Street 7, DHA Phase 5, Lahore, Pakistan",
            "118, Block F, Johar Town, Lahore, Pakistan",
            "25-B, Main Boulevard, Model Town, Lahore, Pakistan"
        ],
        "coworking_addresses": [
            "The Desk Gulberg, 94-B Hali Road, Gulberg II, Lahore, Pakistan",
            "Cantt WorkHub, 12 Sarwar Road, Lahore Cantt, Lahore, Pakistan",
            "WorkNest Johar, 123-G2, Phase 2, Johar Town, Lahore, Pakistan",
            "Bahria Business Center, 14 Civic Center, Bahria Town Sector C, Lahore, Pakistan",
            "CubeSpace DHA, 10-C Sector C, DHA Phase 5, Lahore, Pakistan",
            "Shalimar Hub, 22 Shalimar Link Road, Baghbanpura, Lahore, Pakistan",
            "Lake City WorkPoint, 20 Business District, Lake City, Lahore, Pakistan",
            "NLC Workspace, Plot 3, Sector B, New Lahore City Phase 2, Lahore, Pakistan",
            "Rahbar CoWork, 18-A Block A, DHA Rahbar Phase 4, Lahore, Pakistan",
            "FT Coworking Lounge, 45-A Main Blvd, Faisal Town, Lahore, Pakistan"
        ]
    }
}

# Populate data per country
all_employees = []  # Track all created employees
for country, data in address_data.items():
    city = data["city"]
    coworking_entries = []

    # Add coworking spaces (geocoded)
    for addr in data["coworking_addresses"]:
        lat, lon = geocode_address(addr)

        if lat and lon:
            # Generate random pricing
            base_price = random.randint(5, 25)
            
            # Sample amenities and packages
            amenities = json.dumps([
                "High-speed WiFi", "24/7 Access", "Coffee & Tea", "Printing Services",
                "Meeting Rooms", "Phone Booths", "Parking", "Reception Services"
            ])
            
            packages = json.dumps([
                {
                    "id": 1,
                    "name": "Hot Desk",
                    "price_per_hour": base_price,
                    "price_per_day": base_price * 8,
                    "description": "Flexible workspace with shared amenities",
                    "features": ["WiFi", "Coffee", "Printing"],
                    "amenities": ["High-speed WiFi", "Premium Coffee", "Printing Services", "Meeting Rooms"]
                },
                {
                    "id": 2,
                    "name": "Dedicated Desk",
                    "price_per_day": base_price * 10,
                    "price_per_month": base_price * 200,
                    "description": "Your own desk in shared office space",
                    "features": ["WiFi", "Coffee", "Storage", "24/7 Access"],
                    "amenities": ["High-speed WiFi", "Premium Coffee", "Storage Locker", "24/7 Access", "Phone Booth"]
                },
                {
                    "id": 3,
                    "name": "Private Office",
                    "price_per_day": base_price * 20,
                    "price_per_month": base_price * 400,
                    "description": "Private office space for teams",
                    "features": ["WiFi", "Coffee", "Meeting Room", "Phone", "Storage"],
                    "amenities": ["High-speed WiFi", "Premium Coffee", "Private Meeting Room", "Dedicated Phone Line", "Storage Cabinet", "Parking"]
                }
            ])
            
            cowork = coworking_model.CoworkingSpaceListing(
                title=addr.split(",")[0],
                description=f"Modern coworking space in {city} with flexible workspace solutions",
                address=addr,
                city=city,
                country=country,
                latitude=lat,
                longitude=lon,
                price_per_hour=base_price,
                price_per_day=base_price * 8,
                price_per_week=base_price * 35,
                price_per_month=base_price * 120,
                opening_hours="Mon-Fri: 8:00 AM - 8:00 PM, Sat-Sun: 9:00 AM - 6:00 PM",
                amenities=amenities,
                packages=packages,
                is_verified=True
            )
            db.add(cowork)
            db.flush()
            coworking_entries.append({
                "id": cowork.id,
                "title": cowork.title,
                "address": addr,
                "lat": lat,
                "lon": lon
            })

    # Add employees (with attendance + coworking proximity + bookings)
    for idx, emp_addr in enumerate(data["employee_addresses"]):
        emp_lat, emp_lon = geocode_address(emp_addr)
        if not emp_lat or not emp_lon:
            continue

        emp = employee_model.Employee(
            first_name=f"{country}",
            last_name=f"Employee {idx+1}",
            email=f"{country.lower()}_emp{idx+1}@test.com",
            password_hash=hash_password("admin"),
            address=emp_addr,
            city=city,
            zip_code="54000",
            country="Pakistan",
            latitude=emp_lat,
            longitude=emp_lon,
            timezone="Asia/Karachi",
            phone_number=f"+92-300-123456{idx}",
            profile_picture_url="",
            invite_token_used="sample_token"
        )
        db.add(emp)
        db.flush()
        all_employees.append(emp)  # Track this employee

        # Create employer-employee relationship
        emp_rel = employer_employee_model.EmployerEmployee(
            employer_id=employer.id,
            employee_id=emp.id,
            role_title=f"Remote {country} Worker",
            status="active"
        )
        db.add(emp_rel)

        # Skip general attendance generation to avoid duplicates
        # Detailed attendance will be created specifically for Employee 1 below

        # Assign coworking spaces: 5 near, 5 far
        distances = []
        for cw in coworking_entries:
            dist = calculate_distance_km(emp_lat, emp_lon, cw["lat"], cw["lon"])
            distances.append((dist, cw))
        distances.sort(key=lambda x: x[0])

        near = [c for d, c in distances if d <= 10][:5]
        far = [c for d, c in distances if d > 10][:5]

        # ✅ Create 1 coworking booking for employee
        if near:
            space = random.choice(near)
            booking_type = random.choice(["daily", "weekly", "monthly"])
            start_date = datetime.now().date() - timedelta(days=random.randint(0, 5))
            end_date = start_date + timedelta(days={
                "daily": 1,
                "weekly": 7,
                "monthly": 30
            }[booking_type])

            # Calculate cost in USD based on booking type
            cost_per_day = {
                "daily": 25.0,    # $25 per day
                "weekly": 150.0,  # $150 per week  
                "monthly": 500.0  # $500 per month
            }
            
            booking = booking_model.CoworkingBooking(
                employer_id=employer.id,
                employee_id=emp.id,
                coworking_space_id=space["id"],
                booking_type=booking_type,
                start_date=start_date,
                end_date=end_date,
                total_cost=cost_per_day[booking_type],
                duration_per_day=8,  # 8 hours per day
                subscription_mode="full_time",
                notes=f"Booking for {emp.first_name} {emp.last_name} at {space['title']}"
            )
            db.add(booking)

# ✅ Create comprehensive attendance data for Employee 1 based on their coworking bookings
print("📊 Creating detailed attendance records for Employee 1...")

# Get Employee 1 (first employee created)
employee_1 = all_employees[0]  # First employee in the list

# Create a specific monthly booking for Employee 1 for better demonstration
# Start from beginning of current month to ensure full month coverage
current_month_start = datetime.now().replace(day=1).date()
monthly_booking_start = current_month_start - timedelta(days=30)  # Include previous month too
monthly_booking_end = current_month_start + timedelta(days=60)     # Include next month

# Find a good coworking space for Employee 1
emp_1_lat, emp_1_lon = 31.535814, 74.3404292  # Employee 1's coordinates
best_space = None
min_distance = float('inf')

for cw in coworking_entries:
    dist = calculate_distance_km(emp_1_lat, emp_1_lon, cw["lat"], cw["lon"])
    if dist < min_distance:
        min_distance = dist
        best_space = cw

# Create a comprehensive monthly booking for Employee 1
if best_space:
    comprehensive_booking = booking_model.CoworkingBooking(
        employer_id=employer.id,
        employee_id=employee_1.id,
        coworking_space_id=best_space["id"],
        booking_type="monthly",
        start_date=monthly_booking_start,
        end_date=monthly_booking_end,
        total_cost=500.0,  # $500 for monthly booking
        duration_per_day=8,  # 8 hours per day
        subscription_mode="full_time",
        days_of_week="mon,tue,wed,thu,fri",  # Weekdays only
        notes=f"Monthly coworking booking for {employee_1.first_name} {employee_1.last_name} at {best_space['title']}"
    )
    db.add(comprehensive_booking)
    
    print(f"📅 Created monthly booking for {employee_1.first_name} from {monthly_booking_start} to {monthly_booking_end}")

    # ✅ Create additional future bookings for Employee 1 to show upcoming coworking days
    print("📅 Creating future coworking bookings for Employee 1...")
    
    # Future Booking 1: Weekly booking starting right after current monthly booking ends
    future_booking_1_start = monthly_booking_end + timedelta(days=1)
    future_booking_1_end = future_booking_1_start + timedelta(days=7)
    
    future_booking_1 = booking_model.CoworkingBooking(
        employer_id=employer.id,
        employee_id=employee_1.id,
        coworking_space_id=best_space["id"],
        booking_type="weekly",
        start_date=future_booking_1_start,
        end_date=future_booking_1_end,
        total_cost=150.0,  # $150 for weekly booking
        duration_per_day=8,
        subscription_mode="full_time",
        days_of_week="mon,tue,wed,thu,fri",  # Weekdays only
        notes=f"Weekly coworking booking for {employee_1.first_name} {employee_1.last_name} at {best_space['title']}"
    )
    db.add(future_booking_1)
    print(f"  📅 Future weekly booking: {future_booking_1_start} to {future_booking_1_end}")
    
    # Future Booking 2: Another monthly booking starting 2 weeks after the weekly one
    future_booking_2_start = future_booking_1_end + timedelta(days=14)
    future_booking_2_end = future_booking_2_start + timedelta(days=30)
    
    future_booking_2 = booking_model.CoworkingBooking(
        employer_id=employer.id,
        employee_id=employee_1.id,
        coworking_space_id=best_space["id"],
        booking_type="monthly",
        start_date=future_booking_2_start,
        end_date=future_booking_2_end,
        total_cost=500.0,  # $500 for monthly booking
        duration_per_day=8,
        subscription_mode="full_time",
        days_of_week="mon,tue,wed,thu,fri",  # Weekdays only
        notes=f"Extended monthly coworking booking for {employee_1.first_name} {employee_1.last_name} at {best_space['title']}"
    )
    db.add(future_booking_2)
    print(f"  📅 Future monthly booking: {future_booking_2_start} to {future_booking_2_end}")
    
    # Future Booking 3: Daily bookings for specific days (flexible schedule)
    future_daily_dates = [
        future_booking_2_end + timedelta(days=7),   # 1 week after monthly booking ends
        future_booking_2_end + timedelta(days=14),  # 2 weeks after
        future_booking_2_end + timedelta(days=21),  # 3 weeks after
    ]
    
    for i, daily_date in enumerate(future_daily_dates):
        daily_booking = booking_model.CoworkingBooking(
            employer_id=employer.id,
            employee_id=employee_1.id,
            coworking_space_id=best_space["id"],
            booking_type="daily",
            start_date=daily_date,
            end_date=daily_date,
            total_cost=25.0,  # $25 for daily booking
            duration_per_day=8,
            subscription_mode="full_time",
            notes=f"Flexible daily coworking booking #{i+1} for {employee_1.first_name} {employee_1.last_name} at {best_space['title']}"
        )
        db.add(daily_booking)
        print(f"  📅 Future daily booking #{i+1}: {daily_date}")

# Create realistic attendance records for Employee 1's booking period
attendance_patterns = [
    # Different attendance scenarios
    {"type": "full_day", "hours": 8.5, "probability": 0.6},      # 60% full days
    {"type": "partial_day", "hours": 5.5, "probability": 0.25},  # 25% partial days  
    {"type": "absent", "hours": 0, "probability": 0.15}          # 15% absent days
]

# Only create attendance up to current date (August 11, 2025)
today = datetime.now().date()
current_date = monthly_booking_start
while current_date <= min(monthly_booking_end, today):  # Don't go beyond today
    # Only create attendance for weekdays (Monday=0, Sunday=6)
    if current_date.weekday() < 5:  # Monday to Friday
        
        # Determine attendance type based on probability
        rand = random.random()
        if rand < 0.6:  # 60% chance - Full day
            attendance_type = "full_day"
            work_hours = random.uniform(8.0, 9.5)
            clock_in_hour = random.randint(8, 9)
            clock_in_minute = random.randint(0, 59)
        elif rand < 0.85:  # 25% chance - Partial day
            attendance_type = "partial_day"
            work_hours = random.uniform(4.0, 7.5)
            clock_in_hour = random.randint(9, 11)
            clock_in_minute = random.randint(0, 59)
        else:  # 15% chance - Absent
            attendance_type = "absent"
            work_hours = 0
            clock_in_hour = None
            clock_in_minute = None
        
        # Create attendance record
        if attendance_type != "absent":
            clock_in_time = datetime.combine(current_date, datetime.min.time().replace(
                hour=clock_in_hour, 
                minute=clock_in_minute
            ))
            clock_out_time = clock_in_time + timedelta(hours=work_hours)
            
            # Calculate total hours worked
            total_hours = work_hours
            
            # Determine status based on hours
            if total_hours >= 8:
                status = "ATTENDED"
            elif total_hours >= 4:
                status = "PARTIAL"
            else:
                status = "ABSENT"
            
            attendance_record = attendance_model.Attendance(
                employee_id=employee_1.id,
                employer_id=employer.id,
                date=current_date,
                clock_in=clock_in_time,
                clock_out=clock_out_time,
                total_hours=total_hours,
                status=status
            )
            db.add(attendance_record)
            print(f"  ✅ {current_date}: {status} - {total_hours:.1f}h ({clock_in_time.strftime('%H:%M')} - {clock_out_time.strftime('%H:%M')})")
        else:
            # Create absent record
            attendance_record = attendance_model.Attendance(
                employee_id=employee_1.id,
                employer_id=employer.id,
                date=current_date,
                clock_in=None,
                clock_out=None,
                total_hours=0.0,
                status="ABSENT"
            )
            db.add(attendance_record)
            print(f"  ❌ {current_date}: ABSENT - Booked but not attended")
    
    current_date += timedelta(days=1)

print(f"📊 Created comprehensive attendance records for {employee_1.first_name} {employee_1.last_name}")

# ✅ Create attendance records for all other employees
print("📊 Creating attendance records for all employees...")

for employee in all_employees:
    if employee.id == employee_1.id:
        continue  # Skip employee_1 as we already created their records
    
    # Different performance levels for variety
    if employee.id % 3 == 0:  # High performer
        attendance_rate = 0.9
        punctuality_rate = 0.95
    elif employee.id % 3 == 1:  # Average performer
        attendance_rate = 0.75
        punctuality_rate = 0.8
    else:  # Below average performer
        attendance_rate = 0.6
        punctuality_rate = 0.65
    
    # Create attendance records for the last 30 days
    for i in range(30):
        current_date = datetime.now().date() - timedelta(days=i)
        
        # Skip weekends for most employees (some might work weekends)
        if current_date.weekday() >= 5 and random.random() > 0.2:
            continue
        
        # Determine if employee attended based on their rate
        attended = random.random() < attendance_rate
        
        if attended:
            # Determine punctuality and hours worked
            is_punctual = random.random() < punctuality_rate
            
            if is_punctual:
                # On time: 8-9 hours
                clock_in = datetime.combine(current_date, time(9, 0)) + timedelta(minutes=random.randint(-5, 15))
                hours_worked = random.uniform(8.0, 9.0)
            else:
                # Late: 6-8 hours (came late or left early)
                clock_in = datetime.combine(current_date, time(9, 0)) + timedelta(minutes=random.randint(30, 120))
                hours_worked = random.uniform(6.0, 8.0)
            
            clock_out = clock_in + timedelta(hours=hours_worked)
            
            # Determine status based on hours
            if hours_worked >= 8.0:
                status = attendance_model.AttendanceStatus.ATTENDED
            elif hours_worked >= 4.0:
                status = attendance_model.AttendanceStatus.PARTIAL
            else:
                status = attendance_model.AttendanceStatus.ABSENT
        else:
            # Absent
            clock_in = None
            clock_out = None
            hours_worked = 0.0
            status = attendance_model.AttendanceStatus.ABSENT
        
        attendance = attendance_model.Attendance(
            employee_id=employee.id,
            employer_id=employer.id,
            date=current_date,
            clock_in=clock_in,
            clock_out=clock_out,
            total_hours=hours_worked,
            status=status,
            notes=f"Generated sample data for {current_date}"
        )
        db.add(attendance)

print(f"📊 Created attendance records for all {len(all_employees)} employees")

# ✅ Create comprehensive sample tasks with assignments
print("📝 Creating sample tasks with assignments...")

task_data = [
    {
        "title": "Complete Q1 Financial Report",
        "description": "Prepare comprehensive financial report for Q1 including revenue analysis, expense breakdown, and profit margins. Include charts and recommendations for Q2.",
        "priority": "high",
        "status": "in_progress",
        "due_date": datetime.now().date() + timedelta(days=7)
    },
    {
        "title": "Update Employee Handbook",
        "description": "Review and update the employee handbook with new policies, remote work guidelines, and benefits information.",
        "priority": "medium",
        "status": "pending",
        "due_date": datetime.now().date() + timedelta(days=14)
    },
    {
        "title": "Organize Team Building Event",
        "description": "Plan and organize a team building event for all remote employees. Research venues, activities, and coordinate schedules.",
        "priority": "low",
        "status": "pending",
        "due_date": datetime.now().date() + timedelta(days=30)
    },
    {
        "title": "Client Presentation Preparation",
        "description": "Prepare presentation materials for the upcoming client meeting. Include project timeline, deliverables, and budget breakdown.",
        "priority": "high",
        "status": "completed",
        "due_date": datetime.now().date() - timedelta(days=2)
    },
    {
        "title": "Security Audit Review",
        "description": "Review the recent security audit report and implement recommended security measures across all systems.",
        "priority": "high",
        "status": "pending",
        "due_date": datetime.now().date() + timedelta(days=5)
    },
    {
        "title": "Website Content Update",
        "description": "Update company website with new service offerings, team photos, and client testimonials.",
        "priority": "medium",
        "status": "in_progress",
        "due_date": datetime.now().date() + timedelta(days=10)
    }
]

created_tasks = []
for task_info in task_data:
    task = task_model.Task(
        title=task_info["title"],
        description=task_info["description"],
        priority=getattr(task_model.TaskPriority, task_info["priority"].upper()),
        status=getattr(task_model.TaskStatus, task_info["status"].upper()),
        due_date=task_info["due_date"],
        employer_id=employer.id,
        created_by_id=employer.id
    )
    db.add(task)
    db.flush()  # Get the task ID
    created_tasks.append(task)
    
    # Assign tasks to employees (assign all tasks to first employee for demo)
    if all_employees:
        # Assign to the first employee (Pakistan Employee 1)
        assigned_employee = all_employees[0]
        assignment = task_assignment_model.TaskAssignment(
            task_id=task.id,
            employee_id=assigned_employee.id,
            employer_id=employer.id,
            assigned_by_id=employer.id,
            assigned_at=datetime.now() - timedelta(days=random.randint(1, 5))
        )
        db.add(assignment)
        
        # Add some comments to completed/in-progress tasks
        if task_info["status"] == "completed":
            comment = task_comment_model.TaskComment(
                task_id=task.id,
                author_id=employer.id,
                content=f"Great work on completing this task! The {task_info['title'].lower()} looks excellent.",
                created_at=datetime.now() - timedelta(days=1)
            )
            db.add(comment)
        elif task_info["status"] == "in_progress":
            comment = task_comment_model.TaskComment(
                task_id=task.id,
                author_id=employer.id,
                content=f"Please provide an update on the progress of {task_info['title'].lower()}. Let me know if you need any additional resources.",
                created_at=datetime.now() - timedelta(hours=6)
            )
            db.add(comment)

# ✅ Create comprehensive sample notifications for the employer
print("📢 Creating sample notifications...")

notification_data = [
    {
        "type": "task_assigned",
        "title": "New Task Assigned",
        "message": f"Task 'Complete Q1 Financial Report' has been assigned to {all_employees[0].first_name} {all_employees[0].last_name}.",
        "is_read": False,
        "created_at": datetime.now() - timedelta(hours=2)
    },
    {
        "type": "task_completed",
        "title": "Task Completed",
        "message": f"{all_employees[1].first_name} {all_employees[1].last_name} has completed the task 'Client Presentation Preparation'.",
        "is_read": False,
        "created_at": datetime.now() - timedelta(hours=4)
    },
    {
        "type": "employee_joined",
        "title": "New Employee Joined",
        "message": f"Welcome {all_employees[2].first_name} {all_employees[2].last_name} to the team! They have successfully joined your organization.",
        "is_read": True,
        "created_at": datetime.now() - timedelta(days=1)
    },
    {
        "type": "booking_created",
        "title": "Coworking Space Booked",
        "message": f"Monthly coworking space booking created for {employee_1.first_name} {employee_1.last_name} at The Desk Gulberg.",
        "is_read": False,
        "created_at": datetime.now() - timedelta(hours=6)
    },
    {
        "type": "attendance_alert",
        "title": "Attendance Alert",
        "message": f"{all_employees[0].first_name} {all_employees[0].last_name} was absent on a booked coworking day (July 31, 2025).",
        "is_read": False,
        "created_at": datetime.now() - timedelta(hours=8)
    },
    {
        "type": "task_assigned",
        "title": "High Priority Task",
        "message": f"Urgent task 'Security Audit Review' has been assigned to {all_employees[3].first_name} {all_employees[3].last_name}.",
        "is_read": True,
        "created_at": datetime.now() - timedelta(days=2)
    },
    {
        "type": "booking_created",
        "title": "Future Booking Confirmed",
        "message": f"Weekly coworking booking confirmed for {employee_1.first_name} {employee_1.last_name} starting August 25, 2025.",
        "is_read": False,
        "created_at": datetime.now() - timedelta(hours=12)
    },
    {
        "type": "info",
        "title": "System Update",
        "message": "Your dashboard has been updated with new attendance tracking features and improved analytics.",
        "is_read": True,
        "created_at": datetime.now() - timedelta(days=3)
    },
    {
        "type": "warning",
        "title": "Deadline Reminder",
        "message": "Task 'Update Employee Handbook' is due in 3 days. Please check the progress with your team.",
        "is_read": False,
        "created_at": datetime.now() - timedelta(hours=1)
    },
    {
        "type": "task_completed",
        "title": "Team Achievement",
        "message": f"Congratulations! {all_employees[4].first_name} {all_employees[4].last_name} has completed 'Website Content Update' ahead of schedule.",
        "is_read": True,
        "created_at": datetime.now() - timedelta(days=1, hours=6)
    },
    {
        "type": "attendance_alert",
        "title": "Perfect Attendance",
        "message": f"{employee_1.first_name} {employee_1.last_name} maintained perfect attendance this week with consistent 8+ hour workdays.",
        "is_read": False,
        "created_at": datetime.now() - timedelta(minutes=30)
    },
    {
        "type": "employee_joined",
        "title": "Team Growth",
        "message": "Your team has grown to 5 active employees. Consider scheduling a team meeting to welcome new members.",
        "is_read": True,
        "created_at": datetime.now() - timedelta(days=4)
    }
]

for notif_data in notification_data:
    notification = notification_model.Notification(
        employer_id=employer.id,
        type=notif_data["type"],
        title=notif_data["title"],
        message=notif_data["message"],
        is_read=notif_data["is_read"],
        created_at=notif_data["created_at"]
    )
    db.add(notification)

print(f"📢 Created {len(notification_data)} sample notifications")
print(f"   - {sum(1 for n in notification_data if not n['is_read'])} unread notifications")
print(f"   - {sum(1 for n in notification_data if n['is_read'])} read notifications")

# ✅ Create sample coworking users
print("👤 Creating sample coworking users...")

from shared.models.coworking_user import CoworkingUser
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create sample coworking users
coworking_users_data = [
    {
        "first_name": "Farrukh",
        "last_name": "Naseem",
        "email": "farrukh.naseem@kayasystems.com",
        "password": "password123",
        "phone": "+92-300-1234567",
        "company_name": "TechHub Coworking",
        "business_type": "Technology",
        "address": "123 Tech Street, Lahore, Pakistan"
    },
    {
        "first_name": "Sarah",
        "last_name": "Ahmed",
        "email": "sarah@workspaceplus.com",
        "password": "password123",
        "phone": "+92-321-9876543",
        "company_name": "WorkSpace Plus",
        "business_type": "Business Services",
        "address": "456 Business Ave, Karachi, Pakistan"
    }
]

for user_data in coworking_users_data:
    # Check if user already exists
    existing_user = db.query(CoworkingUser).filter(CoworkingUser.email == user_data["email"]).first()
    if not existing_user:
        hashed_password = pwd_context.hash(user_data["password"])
        coworking_user = CoworkingUser(
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            email=user_data["email"],
            password_hash=hashed_password,
            phone=user_data["phone"],
            created_at=datetime.now()
        )
        db.add(coworking_user)
        print(f"   ✅ Created coworking user: {user_data['first_name']} {user_data['last_name']} ({user_data['email']})")
    else:
        print(f"   ⚠️ Coworking user already exists: {user_data['email']}")

db.commit()
print("✅ Sample data created with geocoded coworking spaces, employees, attendance, coworking bookings, tasks, notifications, and coworking users.")
