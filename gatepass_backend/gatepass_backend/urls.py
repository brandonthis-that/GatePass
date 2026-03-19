from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from assets.views import AssetViewSet
from gate_logs.views import GateLogViewSet
from users.views import AdminUserViewSet, DayScholarViewSet, UserProfileView, UserRegistrationView
from vehicles.views import VehicleViewSet
from visitors.views import VisitorViewSet

router = DefaultRouter()
router.register(r"users", AdminUserViewSet, basename="user")
router.register(r"assets", AssetViewSet, basename="asset")
router.register(r"vehicles", VehicleViewSet, basename="vehicle")
router.register(r"visitors", VisitorViewSet, basename="visitor")
router.register(r"gate-logs", GateLogViewSet, basename="gate-log")
router.register(r"day-scholars", DayScholarViewSet, basename="day-scholar")

urlpatterns = [
    path("admin/", admin.site.urls),
    # Auth
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User self-profile
    path("api/users/me/", UserProfileView.as_view(), name="user_profile"),
    # Legacy public registration (kept for backward compat; admin creation preferred)
    path("api/users/register/", UserRegistrationView.as_view(), name="user_register"),
    # All viewset routes (includes /api/users/ CRUD)
    path("api/", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
