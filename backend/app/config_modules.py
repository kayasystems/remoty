"""
Module Configuration for Independent Services
Defines configuration for employer and coworking modules
"""
import os
from typing import Dict, Any

class ModuleConfig:
    """Base configuration for modules"""
    
    # Database configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./secondhire.db")
    
    # JWT Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15

class EmployerConfig(ModuleConfig):
    """Configuration specific to Employer module"""
    
    MODULE_NAME = "employer"
    API_PREFIX = "/employer"
    PORT = 8000
    
    # CORS settings for employer frontend
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # Module-specific features
    FEATURES = {
        "employee_management": True,
        "task_management": True,
        "attendance_tracking": True,
        "coworking_booking": True,
        "dashboard_analytics": True
    }

class CoworkingConfig(ModuleConfig):
    """Configuration specific to Coworking module"""
    
    MODULE_NAME = "coworking"
    API_PREFIX = "/coworking"
    PORT = 8001
    
    # CORS settings for coworking frontend
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3002"
    ]
    
    # Module-specific features
    FEATURES = {
        "space_management": True,
        "booking_management": True,
        "revenue_analytics": True,
        "dashboard_stats": True,
        "profile_management": True
    }

def get_config(module_name: str) -> ModuleConfig:
    """Get configuration for specific module"""
    configs = {
        "employer": EmployerConfig(),
        "coworking": CoworkingConfig()
    }
    
    return configs.get(module_name, ModuleConfig())
