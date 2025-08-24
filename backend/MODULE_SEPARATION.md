# Remoty - Module Separation Documentation

## Overview
The Remoty application has been completely separated into independent modules to prevent code conflicts and ensure each module can run independently without dependencies on other modules.

## Module Architecture

### 1. Employer Module (Port 8000)
**File**: `app/main_employer.py`
**Startup**: `python start_employer.py`

**Endpoints**:
- `/employer/*` - All employer management functions
- `/admin/*` - Admin functions
- `/employee/*` - Employee functions
- `/docs` - API documentation
- `/health` - Health check

**Features**:
- Employee management
- Task management
- Attendance tracking
- Coworking space booking
- Dashboard analytics

### 2. Coworking Module (Port 8001)
**File**: `app/main_coworking.py`
**Startup**: `python start_coworking.py`

**Endpoints**:
- `/coworking/*` - All coworking space management functions
- `/docs` - API documentation
- `/health` - Health check

**Features**:
- Space management
- Booking management
- Revenue analytics
- Dashboard statistics
- Profile management

## Independent Routes

### Employer Routes
- `app/routes/employer.py` - Main employer endpoints
- `app/routes/admin.py` - Admin functions
- `app/routes/employee.py` - Employee functions

### Coworking Routes
- `app/routes/coworking_complete.py` - All coworking endpoints in one file
  - Authentication (register, login)
  - Profile management
  - Space management
  - Booking management
  - Dashboard statistics
  - Revenue analytics

## Database Sharing
Both modules share the same database (`secondhire.db`) but access different tables:

**Employer Module Tables**:
- employers
- employees
- employer_employee
- tasks
- task_assignments
- task_comments
- attendance
- notifications

**Coworking Module Tables**:
- coworking_users
- coworkingspacelisting
- bookings (shared for booking relationships)

## Running the Modules

### Option 1: Run Individually
```bash
# Start Employer Module (Port 8000)
cd backend
python start_employer.py

# Start Coworking Module (Port 8001) - In separate terminal
cd backend
python start_coworking.py
```

### Option 2: Run with Docker Compose
```bash
cd backend
docker-compose up
```

### Option 3: Run Both Together (Legacy)
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Configuration

### Employer Frontend
- Base URL: `http://localhost:8000`
- API Endpoints: `/employer/*`, `/admin/*`, `/employee/*`

### Coworking Frontend
- Base URL: `http://localhost:8001`
- API Endpoints: `/coworking/*`

## Benefits of Separation

1. **No Code Conflicts**: Each module has its own routes and dependencies
2. **Independent Deployment**: Modules can be deployed separately
3. **Scalability**: Each module can be scaled independently
4. **Maintenance**: Easier to maintain and debug individual modules
5. **Development**: Teams can work on different modules without conflicts

## Migration from Combined System

If you're currently using the combined system (`app/main.py`), you can migrate by:

1. **Stop the current server**
2. **Start the employer module**: `python start_employer.py`
3. **Update frontend API base URL** if needed
4. **For coworking features**: Start coworking module on port 8001

## Configuration

Module-specific configurations are in `app/config_modules.py`:
- Database settings
- CORS origins
- Feature flags
- Port configurations

## Health Checks

Both modules provide health check endpoints:
- Employer: `GET http://localhost:8000/health`
- Coworking: `GET http://localhost:8001/health`

## API Documentation

Each module has its own Swagger documentation:
- Employer: `http://localhost:8000/docs`
- Coworking: `http://localhost:8001/docs`
