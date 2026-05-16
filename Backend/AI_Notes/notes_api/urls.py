from django.urls import path
from .views import (
    AuthSignupView, AuthLoginView, 
    NoteListCreateView, ArchivedNoteListView, NoteDetailView, 
    NoteAIGenerateView, PublicNoteView, InsightsView
)

urlpatterns = [
    # Auth
    path('auth/signup', AuthSignupView.as_view(), name='auth-signup'),
    path('auth/login', AuthLoginView.as_view(), name='auth-login'),

    # Notes
    path('notes', NoteListCreateView.as_view(), name='note-list-create'),
    path('notes/archived', ArchivedNoteListView.as_view(), name='note-archived-list'),
    path('notes/<uuid:pk>', NoteDetailView.as_view(), name='note-detail'),
    path('notes/<uuid:pk>/ai', NoteAIGenerateView.as_view(), name='note-ai'),

    # Public Share
    path('shared/<uuid:shareId>', PublicNoteView.as_view(), name='shared-note'),

    # Insights
    path('insights', InsightsView.as_view(), name='insights'),
]