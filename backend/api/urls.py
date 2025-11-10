from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, CurrentUserView, StudentProfileView,
    AssetViewSet, VehicleViewSet, GateLogViewSet,
    verify_asset, log_vehicle, list_day_scholars, log_scholar
)

router = DefaultRouter()
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'logs', GateLogViewSet, basename='gatelog')

urlpatterns = [
    # Authentication
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
    
    # Student profile
    path('profile/', StudentProfileView.as_view(), name='student_profile'),
    
    # Guard functions
    path('verify-asset/<int:asset_id>/', verify_asset, name='verify_asset'),
    path('log-vehicle/', log_vehicle, name='log_vehicle'),
    path('day-scholars/', list_day_scholars, name='list_day_scholars'),
    path('log-scholar/<int:scholar_id>/', log_scholar, name='log_scholar'),
    
    # Router URLs
    path('', include(router.urls)),
]
