from gate_logs.models import GateLog
from django.db.models import Q
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsAdmin, IsGuard

from .models import User
from .serializers import (
    UserProfileSerializer,
    UserRegistrationSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
)


class UserRegistrationView(generics.CreateAPIView):
    """Public endpoint — anyone can register."""

    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Authenticated users can view and update their own profile."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        # If user is changing their password, verify old password first
        if 'password' in self.request.data:
            old_password = self.request.data.get('old_password', '')
            user = serializer.instance
            if not user.check_password(old_password):
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'old_password': 'Current password is incorrect.'})
            user.set_password(self.request.data['password'])
            user.must_change_password = False
            user.save()
        else:
            serializer.save()


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin-only CRUD for all users.
    GET    /api/users/           → list all users
    POST   /api/users/           → create a user (any role)
    GET    /api/users/{id}/      → retrieve a user
    PUT    /api/users/{id}/      → full update
    PATCH  /api/users/{id}/      → partial update
    DELETE /api/users/{id}/      → delete a user
    POST   /api/users/{id}/ban/  → ban a user
    POST   /api/users/{id}/unban/→ unban a user
    """

    queryset = User.objects.all().order_by("id")
    permission_classes = [IsAdmin]
    pagination_class = None  # Admins always need the full list for search/filter

    def get_serializer_class(self):
        if self.action == "create":
            return AdminUserCreateSerializer
        if self.action in ("update", "partial_update"):
            return AdminUserUpdateSerializer
        return UserProfileSerializer

    @action(detail=True, methods=["post"])
    def ban(self, request, pk=None):
        user = self.get_object()
        reason = request.data.get("ban_reason", "")
        user.is_banned = True
        user.ban_reason = reason
        user.save(update_fields=["is_banned", "ban_reason"])
        return Response({"status": "banned", "user": UserProfileSerializer(user).data})

    @action(detail=True, methods=["post"])
    def unban(self, request, pk=None):
        user = self.get_object()
        user.is_banned = False
        user.ban_reason = ""
        user.save(update_fields=["is_banned", "ban_reason"])
        return Response({"status": "unbanned", "user": UserProfileSerializer(user).data})


class DayScholarViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Guards use this to list day scholars and toggle their on/off campus status.
    GET  /api/day-scholars/          → list all day scholars
    POST /api/day-scholars/{id}/sign-in/   → mark ON_CAMPUS
    POST /api/day-scholars/{id}/sign-out/  → mark OFF_CAMPUS
    """

    serializer_class = UserProfileSerializer
    permission_classes = [IsGuard | IsAdmin]
    pagination_class = None

    def get_queryset(self):
        queryset = User.objects.filter(is_day_scholar=True)
        search = (self.request.query_params.get("search") or "").strip()
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(student_id__icontains=search)
                | Q(username__icontains=search)
            )
        return queryset.order_by("first_name", "last_name", "student_id")

    @action(detail=True, methods=["post"], url_path="sign-in")
    def sign_in(self, request, pk=None):
        scholar = self.get_object()
        scholar.day_scholar_status = "ON_CAMPUS"
        scholar.save(update_fields=["day_scholar_status"])
        GateLog.objects.create(
            guard=request.user,
            log_type="SCHOLAR_IN",
            student=scholar,
        )
        return Response(
            {"status": "ON_CAMPUS", "student": UserProfileSerializer(scholar).data}
        )

    @action(detail=True, methods=["post"], url_path="sign-out")
    def sign_out(self, request, pk=None):
        scholar = self.get_object()
        scholar.day_scholar_status = "OFF_CAMPUS"
        scholar.save(update_fields=["day_scholar_status"])
        GateLog.objects.create(
            guard=request.user,
            log_type="SCHOLAR_OUT",
            student=scholar,
        )
        return Response(
            {"status": "OFF_CAMPUS", "student": UserProfileSerializer(scholar).data}
        )
