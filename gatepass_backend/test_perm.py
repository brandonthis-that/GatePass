import django
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gatepass_backend.settings")
django.setup()
from rest_framework.permissions import BasePermission
class A(BasePermission): pass
class B(BasePermission): pass
print(A | B)
try: 
    print(A() | B())
except Exception as e: 
    print(e)
