"""
Authentication views for the GatePass API.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.utils import timezone
import logging

from .models import User
from .serializers import (
    UserSerializer, LoginSerializer, RegisterSerializer,
    ChangePasswordSerializer, PasswordResetSerializer,
    TokenRefreshSerializer
)
from .authentication import JWTManager

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login endpoint.
    
    Expected payload:
    {
        "email": "user@anu.ac.ke",
        "password": "userpassword"
    }
    """
    try:
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid login data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        tokens = JWTManager.generate_tokens(user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Serialize user data
        user_serializer = UserSerializer(user)
        
        logger.info(f"User {user.email} logged in successfully")
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user_serializer.data,
                'token': tokens['access_token'],  # For compatibility with frontend
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token'],
                'expires_in': tokens['expires_in']
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Login failed',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    User registration endpoint.
    
    Expected payload:
    {
        "email": "user@anu.ac.ke",
        "password": "userpassword",
        "password_confirm": "userpassword",
        "first_name": "John",
        "last_name": "Doe",
        "role": "student",
        "student_id": "2023001",  // if student
        "staff_id": "STF001",     // if staff
        "phone": "+254712345678",
        "department": "Computer Science"
    }
    """
    try:
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid registration data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        # Generate JWT tokens
        tokens = JWTManager.generate_tokens(user)
        
        # Serialize user data
        user_serializer = UserSerializer(user)
        
        logger.info(f"New user registered: {user.email}")
        
        return Response({
            'success': True,
            'message': 'Registration successful',
            'data': {
                'user': user_serializer.data,
                'token': tokens['access_token'],
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token'],
                'expires_in': tokens['expires_in']
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Get current user information.
    """
    try:
        serializer = UserSerializer(request.user)
        
        return Response({
            'success': True,
            'message': 'User data retrieved successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Me endpoint error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to retrieve user data',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Refresh access token using refresh token.
    
    Expected payload:
    {
        "refresh_token": "your_refresh_token_here"
    }
    """
    try:
        serializer = TokenRefreshSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid token data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        refresh_token = serializer.validated_data['refresh_token']
        
        # Generate new access token
        new_tokens = JWTManager.refresh_access_token(refresh_token)
        
        return Response({
            'success': True,
            'message': 'Token refreshed successfully',
            'data': new_tokens
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Token refresh failed',
            'errors': [str(e)]
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint.
    Note: With JWT, logout is mainly handled client-side by removing tokens.
    """
    try:
        logger.info(f"User {request.user.email} logged out")
        
        return Response({
            'success': True,
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Logout failed',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Change user password.
    
    Expected payload:
    {
        "old_password": "current_password",
        "new_password": "new_password",
        "confirm_password": "new_password"
    }
    """
    try:
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid password data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        logger.info(f"Password changed for user: {request.user.email}")
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Password change failed',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """
    Request password reset.
    
    Expected payload:
    {
        "email": "user@anu.ac.ke"
    }
    """
    try:
        serializer = PasswordResetSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid email',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        # In a real implementation, you would:
        # 1. Generate a secure reset token
        # 2. Send email with reset link
        # 3. Store token with expiration
        
        # For now, just log the request
        logger.info(f"Password reset requested for: {email}")
        
        return Response({
            'success': True,
            'message': 'Password reset instructions sent to your email'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Password reset failed',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
