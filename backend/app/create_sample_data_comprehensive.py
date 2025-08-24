import random
from datetime import datetime, timedelta
from shared.database import SessionLocal
from app.auth import hash_password
from app.utils.geocode import geocode_address, calculate_distance_km
from shared.models import (
    admin as admin_model,
    employer as employer_model,
    employee as employee_model,
    employer_employee as employer_employee_model,
    coworkingspacelisting as coworking_model,
    attendance as attendance_model,
    invitetoken as token_model,
    booking as booking_model,
    task as task_model,
    task_assignment as task_assignment_model
)

db = SessionLocal()

# Clear existing data
print("🧹 Clearing existing data...")
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
print("👤 Creating admin...")
admin = admin_model.Admin(
    username="admin@test.com",
    password_hash=hash_password("admin")
)
db.add(admin)

# Create Employer
print("🏢 Creating employer...")
employer = employer_model.Employer(
    first_name="Test",
    last_name="Employer",
    email="employer@test.com",
    password_hash=hash_password("admin"),
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

# Real Pakistani data for 3 cities
cities_data = {
    "Lahore": {
        "employee_addresses": [
            "House 22, Jail Road, Lahore, Pakistan",
            "House 15, Street 3, Gulberg III, Lahore, Pakistan", 
            "42-A, Street 7, DHA Phase 5, Lahore, Pakistan",
            "118, Block F, Johar Town, Lahore, Pakistan",
            "25-B, Main Boulevard, Model Town, Lahore, Pakistan",
            "33-C, Street 12, Wapda Town, Lahore, Pakistan",
            "88, Block H, Iqbal Town, Lahore, Pakistan",
            "12-A, Cavalry Ground, Lahore, Pakistan",
            "55, Street 9, Garden Town, Lahore, Pakistan",
            "77-B, Main Market, Allama Iqbal Town, Lahore, Pakistan"
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
            "FT Coworking Lounge, 45-A Main Blvd, Faisal Town, Lahore, Pakistan",
            "Valencia Hub, 25 Valencia Housing Society, Lahore, Pakistan",
            "EME Society Workspace, 12-B EME Society, Lahore, Pakistan",
            "Fortress Stadium Hub, 33 Fortress Stadium, Lahore, Pakistan",
            "PIA Society CoWork, 88-A PIA Housing Society, Lahore, Pakistan",
            "Askari Hub, 15 Askari 10, Lahore, Pakistan",
            "Paragon City Workspace, 22 Paragon City, Lahore, Pakistan",
            "Green Town Hub, 44 Green Town, Lahore, Pakistan",
            "Sabzazar CoWork, 66 Sabzazar Scheme, Lahore, Pakistan",
            "Township Hub, 99 Township, Lahore, Pakistan",
            "Mustafa Town Workspace, 11 Mustafa Town, Lahore, Pakistan"
        ],
        "lat": 31.5204,
        "lon": 74.3587,
        "state": "Punjab",
        "zip": "54000"
    },
    "Karachi": {
        "employee_addresses": [
            "House 45, Block 7, Gulshan-e-Iqbal, Karachi, Pakistan",
            "Flat 302, Clifton Block 2, Karachi, Pakistan",
            "House 88, DHA Phase 6, Karachi, Pakistan",
            "Apartment 15B, North Nazimabad Block H, Karachi, Pakistan",
            "House 22, Bahadurabad, Karachi, Pakistan",
            "Villa 33, DHA Phase 8, Karachi, Pakistan",
            "Flat 205, PECHS Block 6, Karachi, Pakistan",
            "House 77, Gulberg Town, Karachi, Pakistan",
            "Apartment 12A, Shahrah-e-Faisal, Karachi, Pakistan",
            "House 99, Malir Cantt, Karachi, Pakistan"
        ],
        "coworking_addresses": [
            "The Hive Clifton, 12-A Clifton Block 4, Karachi, Pakistan",
            "DHA WorkSpace, 25 DHA Phase 5, Karachi, Pakistan",
            "Gulshan Hub, 88 Gulshan-e-Iqbal Block 13, Karachi, Pakistan",
            "PECHS CoWork, 33 PECHS Block 2, Karachi, Pakistan",
            "North Nazimabad Hub, 55 North Nazimabad Block L, Karachi, Pakistan",
            "Bahadurabad Workspace, 77 Bahadurabad, Karachi, Pakistan",
            "Shahrah Faisal Hub, 22 Shahrah-e-Faisal, Karachi, Pakistan",
            "Malir CoWork, 44 Malir Cantt, Karachi, Pakistan",
            "Defence Hub, 66 DHA Phase 2, Karachi, Pakistan",
            "Saddar Workspace, 11 Saddar Town, Karachi, Pakistan",
            "Korangi Hub, 99 Korangi Industrial Area, Karachi, Pakistan",
            "Landhi CoWork, 15 Landhi Town, Karachi, Pakistan",
            "Orangi Hub, 27 Orangi Town, Karachi, Pakistan",
            "Lyari Workspace, 39 Lyari Town, Karachi, Pakistan",
            "Baldia Hub, 51 Baldia Town, Karachi, Pakistan",
            "Bin Qasim CoWork, 63 Bin Qasim Town, Karachi, Pakistan",
            "Gadap Hub, 75 Gadap Town, Karachi, Pakistan",
            "Kemari Workspace, 87 Kemari Town, Karachi, Pakistan",
            "New Karachi Hub, 13 New Karachi Town, Karachi, Pakistan",
            "Shah Faisal CoWork, 26 Shah Faisal Town, Karachi, Pakistan"
        ],
        "lat": 24.8607,
        "lon": 67.0011,
        "state": "Sindh", 
        "zip": "75500"
    },
    "Islamabad": {
        "employee_addresses": [
            "House 25, Street 15, F-8/2, Islamabad, Pakistan",
            "House 88, Street 22, G-10/4, Islamabad, Pakistan",
            "Villa 12, Street 5, E-7, Islamabad, Pakistan",
            "House 33, Street 18, F-10/3, Islamabad, Pakistan",
            "Apartment 15B, Blue Area, Islamabad, Pakistan",
            "House 77, Street 12, G-9/1, Islamabad, Pakistan",
            "Villa 44, Street 8, F-6/2, Islamabad, Pakistan",
            "House 66, Street 25, G-11/2, Islamabad, Pakistan",
            "Apartment 22A, Jinnah Avenue, Islamabad, Pakistan",
            "House 99, Street 30, F-11/4, Islamabad, Pakistan"
        ],
        "coworking_addresses": [
            "Blue Area Hub, 25 Blue Area, Islamabad, Pakistan",
            "F-8 Workspace, 88 F-8 Markaz, Islamabad, Pakistan",
            "G-10 CoWork, 33 G-10/4, Islamabad, Pakistan",
            "E-7 Hub, 55 E-7, Islamabad, Pakistan",
            "F-10 Workspace, 77 F-10 Markaz, Islamabad, Pakistan",
            "G-9 CoWork, 22 G-9/1, Islamabad, Pakistan",
            "F-6 Hub, 44 F-6/2, Islamabad, Pakistan",
            "G-11 Workspace, 66 G-11/2, Islamabad, Pakistan",
            "Jinnah Avenue Hub, 11 Jinnah Avenue, Islamabad, Pakistan",
            "F-11 CoWork, 99 F-11/4, Islamabad, Pakistan",
            "I-8 Hub, 15 I-8 Markaz, Islamabad, Pakistan",
            "H-8 Workspace, 27 H-8/4, Islamabad, Pakistan",
            "I-9 CoWork, 39 I-9/3, Islamabad, Pakistan",
            "H-9 Hub, 51 H-9/2, Islamabad, Pakistan",
            "I-10 Workspace, 63 I-10/4, Islamabad, Pakistan",
            "H-10 CoWork, 75 H-10/3, Islamabad, Pakistan",
            "I-11 Hub, 87 I-11/2, Islamabad, Pakistan",
            "H-11 Workspace, 13 H-11/4, Islamabad, Pakistan",
            "G-13 CoWork, 26 G-13/1, Islamabad, Pakistan",
            "F-17 Hub, 38 F-17, Islamabad, Pakistan"
        ],
        "lat": 33.6844,
        "lon": 73.0479,
        "state": "Islamabad Capital Territory",
        "zip": "44000"
    }
}

# Pakistani first and last names
first_names = ["Ahmed", "Ali", "Hassan", "Hussain", "Muhammad", "Omar", "Usman", "Zain", "Fatima", "Aisha", "Zara", "Sana", "Ayesha", "Mariam", "Khadija"]
last_names = ["Khan", "Ahmed", "Ali", "Shah", "Malik", "Butt", "Chaudhry", "Sheikh", "Qureshi", "Siddiqui", "Rizvi", "Hussain", "Awan", "Dar", "Bhatti"]

# Job roles
job_roles = ["Software Developer", "Marketing Manager", "Sales Executive", "HR Specialist", "Data Analyst", "Project Manager", "Designer", "Content Writer", "Business Analyst", "QA Engineer"]

# Task titles and descriptions
task_templates = [
    {"title": "Website Redesign", "desc": "Complete redesign of company website with modern UI/UX"},
    {"title": "Market Research", "desc": "Conduct comprehensive market analysis for Q4 strategy"},
    {"title": "Client Presentation", "desc": "Prepare and deliver presentation to key stakeholders"},
    {"title": "Database Migration", "desc": "Migrate legacy database to new cloud infrastructure"},
    {"title": "Social Media Campaign", "desc": "Launch new social media marketing campaign"},
    {"title": "Performance Review", "desc": "Complete quarterly performance reviews for team"},
    {"title": "Product Launch", "desc": "Coordinate product launch activities and timeline"},
    {"title": "Training Program", "desc": "Develop and implement employee training program"},
    {"title": "Budget Planning", "desc": "Prepare annual budget forecast and analysis"},
    {"title": "System Integration", "desc": "Integrate new CRM system with existing tools"}
]

print("🏢 Creating coworking spaces...")
all_coworking_spaces = []

for city_name, city_data in cities_data.items():
    print(f"  📍 Adding coworking spaces in {city_name}...")
    for addr in city_data["coworking_addresses"]:
        # Use city coordinates with small random offset for variety
        lat = city_data["lat"] + random.uniform(-0.1, 0.1)
        lon = city_data["lon"] + random.uniform(-0.1, 0.1)
        
        cowork = coworking_model.CoworkingSpaceListing(
            title=addr.split(",")[0],
            address=addr,
            city=city_name,
            latitude=lat,
            longitude=lon,
            is_verified=True
        )
        db.add(cowork)
        db.flush()
        
        all_coworking_spaces.append({
            "id": cowork.id,
            "title": cowork.title,
            "address": addr,
            "city": city_name,
            "lat": lat,
            "lon": lon
        })

print("👥 Creating 30 employees across 3 cities...")
all_employees = []

for city_name, city_data in cities_data.items():
    print(f"  📍 Adding 10 employees in {city_name}...")
    city_coworking = [cw for cw in all_coworking_spaces if cw["city"] == city_name]
    
    for i in range(10):
        emp_addr = city_data["employee_addresses"][i]
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        
        # Use city coordinates with small random offset
        emp_lat = city_data["lat"] + random.uniform(-0.05, 0.05)
        emp_lon = city_data["lon"] + random.uniform(-0.05, 0.05)
        
        emp = employee_model.Employee(
            first_name=first_name,
            last_name=last_name,
            email=f"{first_name.lower()}.{last_name.lower()}{i+1}@test.com",
            password_hash=hash_password("admin"),
            address=emp_addr,
            city=city_name,
            zip_code=city_data["zip"],
            country="Pakistan",
            latitude=emp_lat,
            longitude=emp_lon,
            timezone="Asia/Karachi",
            phone_number=f"+92-300-{random.randint(1000000, 9999999)}",
            profile_picture_url=f"https://ui-avatars.com/api/?name={first_name}+{last_name}&background=random",
            invite_token_used="sample_token",
            status="active"
        )
        db.add(emp)
        db.flush()
        all_employees.append(emp)
        
        # Create employer-employee relationship
        employer_employee_rel = employer_employee_model.EmployerEmployee(
            employer_id=employer.id,
            employee_id=emp.id,
            role_title=random.choice(job_roles),
            status='active',
            notes=f"Employee from {city_name} - {random.choice(job_roles)}"
        )
        db.add(employer_employee_rel)
        
        # Generate 30 days of attendance with realistic patterns
        for d in range(30):
            date_obj = datetime.now() - timedelta(days=d)
            if date_obj.weekday() < 5:  # Weekdays only
                attendance_type = random.choices(
                    ['attended', 'partial', 'absent'],
                    weights=[60, 25, 15],  # 60% full, 25% partial, 15% absent
                    k=1
                )[0]
                
                clock_in = None
                clock_out = None
                total_hours = 0.0
                status = attendance_model.AttendanceStatus.ABSENT
                notes = ""
                
                if attendance_type == 'attended':
                    # Full day attendance (8-9 hours)
                    clock_in = date_obj.replace(hour=random.randint(8, 9), minute=random.randint(0, 59))
                    hours_worked = random.uniform(8.0, 9.5)
                    clock_out = clock_in + timedelta(hours=hours_worked)
                    total_hours = hours_worked
                    status = attendance_model.AttendanceStatus.ATTENDED
                    notes = "Full day attendance completed"
                    
                elif attendance_type == 'partial':
                    # Partial attendance (4-7.9 hours)
                    clock_in = date_obj.replace(hour=random.randint(9, 11), minute=random.randint(0, 59))
                    hours_worked = random.uniform(4.0, 7.9)
                    clock_out = clock_in + timedelta(hours=hours_worked)
                    total_hours = hours_worked
                    status = attendance_model.AttendanceStatus.PARTIAL
                    reasons = ["Late arrival", "Early departure", "Long lunch break", "Personal appointment"]
                    notes = f"Partial attendance - {random.choice(reasons)}"
                    
                else:  # absent
                    # Absent or very minimal hours (<4)
                    if random.choice([True, False]):  # 50% completely absent
                        total_hours = 0.0
                        notes = random.choice(["Sick leave", "Personal leave", "No show", "Family emergency"])
                    else:  # 50% very short attendance
                        clock_in = date_obj.replace(hour=random.randint(10, 12), minute=random.randint(0, 59))
                        hours_worked = random.uniform(1.0, 3.9)
                        clock_out = clock_in + timedelta(hours=hours_worked)
                        total_hours = hours_worked
                        notes = "Very short attendance - left early"
                    status = attendance_model.AttendanceStatus.ABSENT
                
                attendance_record = attendance_model.Attendance(
                    employee_id=emp.id,
                    employer_id=employer.id,
                    date=date_obj.date(),
                    clock_in=clock_in,
                    clock_out=clock_out,
                    total_hours=round(total_hours, 2),
                    status=status,
                    notes=notes
                )
                db.add(attendance_record)
        
        # Create coworking booking (7 out of 10 employees per city)
        if i < 7:  # First 7 employees get bookings
            space = random.choice(city_coworking)
            booking_type = random.choice(["daily", "weekly", "monthly"])
            start_date = datetime.now().date() - timedelta(days=random.randint(0, 10))
            end_date = start_date + timedelta(days={
                "daily": 1,
                "weekly": 7,
                "monthly": 30
            }[booking_type])
            
            booking = booking_model.CoworkingBooking(
                employer_id=employer.id,
                employee_id=emp.id,
                coworking_space_id=space["id"],
                booking_type=booking_type,
                start_date=start_date,
                end_date=end_date
            )
            db.add(booking)

print("📋 Creating tasks and assignments...")
# Create 50 tasks with various statuses and assignments
for i in range(50):
    task_template = random.choice(task_templates)
    
    # Random due date (some past, some future)
    due_date = datetime.now() + timedelta(days=random.randint(-30, 60))
    
    task = task_model.Task(
        title=f"{task_template['title']} - Phase {i+1}",
        description=task_template['desc'],
        status=random.choice(list(task_model.TaskStatus)),
        priority=random.choice(list(task_model.TaskPriority)),
        due_date=due_date,
        employer_id=employer.id,
        created_by_id=employer.id
    )
    db.add(task)
    db.flush()
    
    # Assign task to 1-3 random employees
    num_assignments = random.randint(1, 3)
    assigned_employees = random.sample(all_employees, num_assignments)
    
    for emp in assigned_employees:
        assigned_date = datetime.now() - timedelta(days=random.randint(0, 30))
        completed_date = None
        
        # If task is completed, set completion date
        if task.status == task_model.TaskStatus.COMPLETED:
            completed_date = assigned_date + timedelta(days=random.randint(1, 15))
        
        assignment = task_assignment_model.TaskAssignment(
            task_id=task.id,
            employee_id=emp.id,
            employer_id=employer.id,
            assigned_by_id=employer.id,
            assigned_at=assigned_date,
            completed_at=completed_date,
            notes=f"Task assigned to {emp.first_name} {emp.last_name}"
        )
        db.add(assignment)

db.commit()
print("\n✅ Comprehensive sample data created successfully!")
print(f"📊 Summary:")
print(f"   👤 1 Employer")
print(f"   👥 30 Employees (10 each in Lahore, Karachi, Islamabad)")
print(f"   🏢 60 Coworking spaces (20 per city)")
print(f"   📅 21 Coworking bookings (7 per city)")
print(f"   📋 50 Tasks with multiple assignments")
print(f"   ⏰ 30 days of attendance records")
print(f"   🔗 Complete relationships between all entities")
