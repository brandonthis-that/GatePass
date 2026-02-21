from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsAdmin, IsGuard

from .models import User
from .serializers import UserProfileSerializer, UserRegistrationSerializer


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


class DayScholarViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Guards use this to list day scholars and toggle their on/off campus status.
    GET  /api/day-scholars/          → list all day scholars
    POST /api/day-scholars/{id}/sign-in/   → mark ON_CAMPUS
    POST /api/day-scholars/{id}/sign-out/  → mark OFF_CAMPUS
    """

    serializer_class = UserProfileSerializer
    permission_classes = [IsGuard | IsAdmin]

    def get_queryset(self):
        return User.objects.filter(is_day_scholar=True)

    @action(detail=True, methods=["post"], url_path="sign-in")
    def sign_in(self, request, pk=None):
        scholar = self.get_object()
        scholar.day_scholar_status = "ON_CAMPUS"
        scholar.save(update_fields=["day_scholar_status"])
        return Response(
            {"status": "ON_CAMPUS", "student": UserProfileSerializer(scholar).data}
        )

    @action(detail=True, methods=["post"], url_path="sign-out")
    def sign_out(self, request, pk=None):
        scholar = self.get_object()
        scholar.day_scholar_status = "OFF_CAMPUS"
        scholar.save(update_fields=["day_scholar_status"])
        return Response(
            {"status": "OFF_CAMPUS", "student": UserProfileSerializer(scholar).data}
        )
