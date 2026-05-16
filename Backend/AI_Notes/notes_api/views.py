from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Note
from .serializers import NoteSerializer, UserSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .agent import generate_note_metadata
import collections

User = get_user_model()

def get_auth_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        "token": str(refresh.access_token),
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email
        }
    }

class AuthSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(get_auth_response(user), status=status.HTTP_201_CREATED)
        return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

class AuthLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(username=email, password=password)
        if user is not None:
            return Response(get_auth_response(user))
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

class NoteListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notes = Note.objects.filter(owner=request.user, is_archived=False).order_by('-updated_at')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ArchivedNoteListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notes = Note.objects.filter(owner=request.user, is_archived=True).order_by('-updated_at')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

class NoteDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Note.objects.get(pk=pk, owner=user)
        except Note.DoesNotExist:
            return None

    def get(self, request, pk):
        note = self.get_object(pk, request.user)
        if not note:
            return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(NoteSerializer(note).data)

    def patch(self, request, pk):
        note = self.get_object(pk, request.user)
        if not note:
            return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = NoteSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        note = self.get_object(pk, request.user)
        if not note:
            return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)
        note.delete()
        return Response({"success": True})

class NoteAIGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            note = Note.objects.get(pk=pk, owner=request.user)
        except Note.DoesNotExist:
            return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            ai_data = generate_note_metadata(note.body)
            
            user = request.user
            user.total_summaries_generated += 1
            user.total_action_items_generated += len(ai_data.get('action_items', []))
            user.save()

            return Response(ai_data)
        except Exception as e:
            return Response({"error": "AI generation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PublicNoteView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, shareId):
        try:
            note = Note.objects.get(pk=shareId, is_shared=True)
            return Response({
                "title": note.title,
                "content": note.body,
                "tags": note.tags,
                "updatedAt": note.updated_at
            })
        except Note.DoesNotExist:
            return Response({"error": "Public note not found"}, status=status.HTTP_404_NOT_FOUND)

class InsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notes = Note.objects.filter(owner=request.user)
        
        tag_counts = collections.defaultdict(int)
        for note in notes:
            for tag in note.tags:
                tag_counts[tag] += 1
                
        sorted_tags = sorted([{"tag": k, "count": v} for k, v in tag_counts.items()], key=lambda x: x['count'], reverse=True)[:5]
        
        recent_notes = NoteSerializer(notes.order_by('-updated_at')[:3], many=True).data

        return Response({
            "totalNotes": notes.count(),
            "recentNotes": recent_notes,
            "mostUsedTags": sorted_tags,
            "aiStats": {
                "summaries": request.user.total_summaries_generated,
                "actionItems": request.user.total_action_items_generated
            }
        })
