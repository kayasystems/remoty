# Import all models to ensure they are registered with SQLAlchemy
from . import admin
from . import admin_user
from . import attendance
from . import billing_info
from . import booking
from . import coworking_user
from . import coworkingspacelisting
from . import employee
from . import employer
from . import employer_employee
from . import invitetoken
from . import password_reset_token
from . import amenity

# Import new models if they exist
try:
    from . import task
    from . import task_assignment
    from . import task_comment
    from . import notification
    from . import coworking_images
except ImportError:
    # Models don't exist yet
    pass
