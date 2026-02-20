"""
GatePass Backend URL Configuration

Main URLconf for the Africa Nazarene University Gate Management System.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('authentication.urls')),
    path('api/', include('gatemanager.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site configuration
admin.site.site_header = "GatePass Administration"
admin.site.site_title = "GatePass Admin"
admin.site.index_title = "Africa Nazarene University Gate Management"
