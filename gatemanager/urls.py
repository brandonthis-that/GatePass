"""
URL configuration for gate management API endpoints.
"""

from django.urls import path
from . import views

app_name = 'gatemanager'

urlpatterns = [
    # Asset management
    path('assets/', views.assets_view, name='assets'),
    path('assets/<uuid:asset_id>/', views.asset_detail_view, name='asset-detail'),
    
    # Vehicle management
    path('vehicles/', views.vehicles_view, name='vehicles'),
    path('vehicles/<uuid:vehicle_id>/', views.vehicle_detail_view, name='vehicle-detail'),
    
    # QR Code verification
    path('verify-qr/', views.verify_qr_view, name='verify-qr'),
    
    # Vehicle entry logging
    path('log-vehicle-entry/', views.log_vehicle_entry_view, name='log-vehicle-entry'),
    
    # Day scholar management
    path('day-scholars/', views.day_scholars_view, name='day-scholars'),
    path('day-scholars/<uuid:user_id>/toggle/', views.toggle_scholar_status_view, name='toggle-scholar-status'),
    
    # Gate logs and reporting
    path('logs/', views.gate_logs_view, name='gate-logs'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats_view, name='dashboard-stats'),
]