import random

from faker import Faker

fake = Faker()

# Realistic ANU departments and their course codes
DEPARTMENTS = {
    "ABT": "Business and Technology",
    "ACS": "Computer Science",
    "AED": "Education",
    "ATH": "Theology",
    "ACM": "Commerce",
    "IBM": "International Business Management",
}

YEARS = ["21", "22", "23", "24"]  # Intake years


def _generate_student_id(year: str, dept: str, index: int) -> str:
    """Mimics ANU's real ID format e.g. 21S01ABT026"""
    return f"{year}S01{dept}{index:03d}"


def _generate_email(student_id: str) -> str:
    """Mimics ANU's student email convention"""
    return f"{student_id.lower()}@anu.ac.ke"


def generate_students(count: int = 200) -> list[dict]:
    students = []
    dept_codes = list(DEPARTMENTS.keys())

    for i in range(1, count + 1):
        dept = random.choice(dept_codes)
        year = random.choice(YEARS)
        student_id = _generate_student_id(year, dept, i)

        students.append(
            {
                "student_id": student_id,
                "username": student_id.lower(),
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "email": _generate_email(student_id),
                "phone": f"+2547{random.randint(10000000, 99999999)}",
                "role": "student",
                "is_day_scholar": random.choice([True, False]),
                "day_scholar_status": "OFF_CAMPUS",
                "password": student_id,  # Default password is student ID
            }
        )

    return students


def generate_guards(count: int = 8) -> list[dict]:
    guards = []
    for i in range(1, count + 1):
        guard_id = f"GRD{i:03d}"
        guards.append(
            {
                "student_id": None,
                "username": f"guard{i:03d}",
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "email": f"guard{i:03d}@anu.ac.ke",
                "phone": f"+2547{random.randint(10000000, 99999999)}",
                "role": "guard",
                "is_day_scholar": False,
                "day_scholar_status": "OFF_CAMPUS",
                "password": f"guard{i:03d}pass",
            }
        )
    return guards


def generate_admins() -> list[dict]:
    return [
        {
            "student_id": None,
            "username": "security.manager",
            "first_name": "James",
            "last_name": "Kariuki",
            "email": "security.manager@anu.ac.ke",
            "phone": "+254700000001",
            "role": "admin",
            "is_day_scholar": False,
            "day_scholar_status": "OFF_CAMPUS",
            "password": "admin_secure_2025",
        }
    ]


def fetch_all_accounts() -> list[dict]:
    """
    This is the single method the SISAdapter calls.
    In production this becomes an API call or DB query to the real SIS.
    """
    return generate_students(200) + generate_guards(8) + generate_admins()
