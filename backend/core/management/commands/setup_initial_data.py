from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from core.models import StudentProfile, Asset, Vehicle


class Command(BaseCommand):
    help = 'Sets up initial data for the GatePass system'

    def handle(self, *args, **kwargs):
        self.stdout.write('Setting up initial data...')
        
        # Create user groups
        student_group, _ = Group.objects.get_or_create(name='Student')
        guard_group, _ = Group.objects.get_or_create(name='Guard')
        
        # Create a guard user
        if not User.objects.filter(username='guard1').exists():
            guard = User.objects.create_user(
                username='guard1',
                password='guard123',
                first_name='John',
                last_name='Guard'
            )
            guard.groups.add(guard_group)
            self.stdout.write(self.style.SUCCESS('✓ Created guard user (guard1/guard123)'))
        
        # Create sample students
        students_data = [
            {'username': 'john_doe', 'password': 'student123', 'student_id': 'S12345', 'full_name': 'John Doe', 'is_day_scholar': True},
            {'username': 'jane_smith', 'password': 'student123', 'student_id': 'S12346', 'full_name': 'Jane Smith', 'is_day_scholar': False},
            {'username': 'bob_wilson', 'password': 'student123', 'student_id': 'S12347', 'full_name': 'Bob Wilson', 'is_day_scholar': True},
        ]
        
        for student_data in students_data:
            if not User.objects.filter(username=student_data['username']).exists():
                user = User.objects.create_user(
                    username=student_data['username'],
                    password=student_data['password'],
                    first_name=student_data['full_name'].split()[0],
                    last_name=' '.join(student_data['full_name'].split()[1:])
                )
                user.groups.add(student_group)
                
                profile = StudentProfile.objects.create(
                    user=user,
                    student_id_number=student_data['student_id'],
                    full_name=student_data['full_name'],
                    is_day_scholar=student_data['is_day_scholar']
                )
                
                # Create sample assets
                Asset.objects.create(
                    owner=profile,
                    asset_type='LAPTOP',
                    serial_number=f'LPT{student_data["student_id"]}001',
                    model_name='Dell XPS 15'
                )
                
                # Create sample vehicles
                Vehicle.objects.create(
                    owner=profile,
                    plate_number=f'KDA{student_data["student_id"][-3:]}X',
                    make='Toyota',
                    model='Corolla',
                    color='Silver'
                )
                
                self.stdout.write(self.style.SUCCESS(f'✓ Created student {student_data["username"]} with assets and vehicle'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Initial setup complete!'))
        self.stdout.write('\nTest Credentials:')
        self.stdout.write('  Guard:   guard1 / guard123')
        self.stdout.write('  Student: john_doe / student123')
        self.stdout.write('  Student: jane_smith / student123')
        self.stdout.write('  Student: bob_wilson / student123')
