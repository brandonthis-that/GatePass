#!/usr/bin/env python
"""
Script to create initial test data for the GatePass system.
"""

import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gatepass_backend.settings')
django.setup()

from authentication.models import User
from gatemanager.models import Asset, Vehicle, DayScholarStatus

def create_test_users():
    """Create test users for different roles."""
    
    # Create admin user
    admin, created = User.objects.get_or_create(
        email='admin@anu.ac.ke',
        defaults={
            'first_name': 'System',
            'last_name': 'Administrator',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print(f"✓ Created admin user: {admin.email} / admin123")
    else:
        print(f"✓ Admin user already exists: {admin.email}")
    
    # Create guard user
    guard, created = User.objects.get_or_create(
        email='guard@anu.ac.ke',
        defaults={
            'first_name': 'Security',
            'last_name': 'Guard',
            'role': 'guard',
        }
    )
    if created:
        guard.set_password('guard123')
        guard.save()
        print(f"✓ Created guard user: {guard.email} / guard123")
    else:
        print(f"✓ Guard user already exists: {guard.email}")
    
    # Create student user
    student, created = User.objects.get_or_create(
        email='jdoe@anu.ac.ke',
        defaults={
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'student',
            'student_id': '2023001',
            'department': 'Computer Science',
            'phone': '+254712345678'
        }
    )
    if created:
        student.set_password('pass123')
        student.save()
        print(f"✓ Created student user: {student.email} / pass123")
    else:
        print(f"✓ Student user already exists: {student.email}")
    
    # Create staff user
    staff, created = User.objects.get_or_create(
        email='staff@anu.ac.ke',
        defaults={
            'first_name': 'Jane',
            'last_name': 'Smith',
            'role': 'staff',
            'staff_id': 'STF001',
            'department': 'IT Department',
            'phone': '+254787654321'
        }
    )
    if created:
        staff.set_password('staff123')
        staff.save()
        print(f"✓ Created staff user: {staff.email} / staff123")
    else:
        print(f"✓ Staff user already exists: {staff.email}")
    
    # Create another student for day scholar testing
    student2, created = User.objects.get_or_create(
        email='mary.jane@anu.ac.ke',
        defaults={
            'first_name': 'Mary',
            'last_name': 'Jane',
            'role': 'student',
            'student_id': '2023002',
            'department': 'Business Administration',
            'phone': '+254722334455'
        }
    )
    if created:
        student2.set_password('mary123')
        student2.save()
        print(f"✓ Created student2 user: {student2.email} / mary123")
    else:
        print(f"✓ Student2 user already exists: {student2.email}")

def create_test_assets():
    """Create test assets for users."""
    
    try:
        student = User.objects.get(email='jdoe@anu.ac.ke')
        
        # Create laptop asset
        laptop, created = Asset.objects.get_or_create(
            serial_number='HP123456789',
            defaults={
                'user': student,
                'asset_type': 'laptop',
                'brand': 'HP',
                'model': 'EliteBook 840',
                'description': 'Work laptop for studies'
            }
        )
        if created:
            print(f"✓ Created laptop asset: {laptop.serial_number}")
        else:
            print(f"✓ Laptop asset already exists: {laptop.serial_number}")
        
        # Create phone asset
        phone, created = Asset.objects.get_or_create(
            serial_number='IPHONE987654321',
            defaults={
                'user': student,
                'asset_type': 'phone',
                'brand': 'Apple',
                'model': 'iPhone 13',
                'description': 'Personal smartphone'
            }
        )
        if created:
            print(f"✓ Created phone asset: {phone.serial_number}")
        else:
            print(f"✓ Phone asset already exists: {phone.serial_number}")
            
    except User.DoesNotExist:
        print("⚠ Student user not found, skipping asset creation")

def create_test_vehicles():
    """Create test vehicles for users."""
    
    try:
        student = User.objects.get(email='jdoe@anu.ac.ke')
        staff = User.objects.get(email='staff@anu.ac.ke')
        
        # Create student vehicle
        student_car, created = Vehicle.objects.get_or_create(
            plate_number='KDA123A',
            defaults={
                'user': student,
                'vehicle_type': 'car',
                'make': 'Toyota',
                'model': 'Corolla',
                'color': 'Silver',
                'year': 2020
            }
        )
        if created:
            print(f"✓ Created student vehicle: {student_car.plate_number}")
        else:
            print(f"✓ Student vehicle already exists: {student_car.plate_number}")
        
        # Create staff vehicle
        staff_car, created = Vehicle.objects.get_or_create(
            plate_number='KBX456B',
            defaults={
                'user': staff,
                'vehicle_type': 'car',
                'make': 'Honda',
                'model': 'Civic',
                'color': 'Blue',
                'year': 2019
            }
        )
        if created:
            print(f"✓ Created staff vehicle: {staff_car.plate_number}")
        else:
            print(f"✓ Staff vehicle already exists: {staff_car.plate_number}")
            
    except User.DoesNotExist:
        print("⚠ User not found, skipping vehicle creation")

def create_day_scholar_statuses():
    """Create day scholar statuses for student users."""
    
    students = User.objects.filter(role='student')
    
    for student in students:
        status, created = DayScholarStatus.objects.get_or_create(user=student)
        if created:
            print(f"✓ Created day scholar status for: {student.email}")
        else:
            print(f"✓ Day scholar status already exists for: {student.email}")

def main():
    """Run all setup functions."""
    print("🚀 Setting up GatePass test data...")
    print("=" * 50)
    
    create_test_users()
    print()
    
    create_test_assets()
    print()
    
    create_test_vehicles()
    print()
    
    create_day_scholar_statuses()
    print()
    
    print("=" * 50)
    print("✅ GatePass test data setup complete!")
    print()
    print("🔑 Test Accounts Created:")
    print("   Admin:   admin@anu.ac.ke / admin123")
    print("   Guard:   guard@anu.ac.ke / guard123")
    print("   Student: jdoe@anu.ac.ke / pass123")
    print("   Student: mary.jane@anu.ac.ke / mary123")
    print("   Staff:   staff@anu.ac.ke / staff123")
    print()
    print("🌐 You can now start the Django server:")
    print("   python manage.py runserver")

if __name__ == '__main__':
    main()