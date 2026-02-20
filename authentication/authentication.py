"""
JWT Authentication classes for the GatePass system.
"""

import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from .models import User

class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT Authentication class for API endpoints.
    """
    
    def authenticate(self, request):
        """
        Authenticate the request and return a two-tuple of (user, token).
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(
                token,
                settings.JWT_SETTINGS['SIGNING_KEY'],
                algorithms=[settings.JWT_SETTINGS['ALGORITHM']]
            )
            
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Invalid token payload')
            
            try:
                user = User.objects.get(id=user_id, is_active=True)
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')

class JWTManager:
    """
    Utility class for JWT token management.
    """
    
    @staticmethod
    def generate_tokens(user):
        """
        Generate both access and refresh tokens for a user.
        """
        now = datetime.utcnow()
        
        # Access token payload
        access_payload = {
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'exp': now + settings.JWT_SETTINGS['ACCESS_TOKEN_LIFETIME'],
            'iat': now,
            'token_type': 'access'
        }
        
        # Refresh token payload
        refresh_payload = {
            'user_id': str(user.id),
            'exp': now + settings.JWT_SETTINGS['REFRESH_TOKEN_LIFETIME'],
            'iat': now,
            'token_type': 'refresh'
        }
        
        access_token = jwt.encode(
            access_payload,
            settings.JWT_SETTINGS['SIGNING_KEY'],
            algorithm=settings.JWT_SETTINGS['ALGORITHM']
        )
        
        refresh_token = jwt.encode(
            refresh_payload,
            settings.JWT_SETTINGS['SIGNING_KEY'],
            algorithm=settings.JWT_SETTINGS['ALGORITHM']
        )
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': int(settings.JWT_SETTINGS['ACCESS_TOKEN_LIFETIME'].total_seconds())
        }
    
    @staticmethod
    def verify_token(token):
        """
        Verify and decode a JWT token.
        """
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SETTINGS['SIGNING_KEY'],
                algorithms=[settings.JWT_SETTINGS['ALGORITHM']]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
    
    @staticmethod
    def refresh_access_token(refresh_token):
        """
        Generate a new access token from a valid refresh token.
        """
        try:
            payload = JWTManager.verify_token(refresh_token)
            
            if payload.get('token_type') != 'refresh':
                raise AuthenticationFailed('Invalid token type')
            
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Invalid token payload')
            
            try:
                user = User.objects.get(id=user_id, is_active=True)
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')
            
            # Generate new access token
            now = datetime.utcnow()
            access_payload = {
                'user_id': str(user.id),
                'email': user.email,
                'role': user.role,
                'exp': now + settings.JWT_SETTINGS['ACCESS_TOKEN_LIFETIME'],
                'iat': now,
                'token_type': 'access'
            }
            
            access_token = jwt.encode(
                access_payload,
                settings.JWT_SETTINGS['SIGNING_KEY'],
                algorithm=settings.JWT_SETTINGS['ALGORITHM']
            )
            
            return {
                'access_token': access_token,
                'expires_in': int(settings.JWT_SETTINGS['ACCESS_TOKEN_LIFETIME'].total_seconds())
            }
            
        except Exception as e:
            raise AuthenticationFailed(f'Token refresh failed: {str(e)}')