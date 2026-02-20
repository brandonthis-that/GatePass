"""
URL configuration for authentication app.
"""

from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    
    # User management
    path('me/', views.me_view, name='me'),
    path('change-password/', views.change_password_view, name='change-password'),
    path('reset-password/', views.reset_password_view, name='reset-password'),
    
    # Token management
    path('refresh/', views.refresh_token_view, name='refresh'),
]