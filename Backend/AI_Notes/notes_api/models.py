from django.db import models
from django.contrib.auth.models import AbstractUser
from uuid import uuid4

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    username = None
    total_summaries_generated = models.IntegerField(default=0)
    total_action_items_generated = models.IntegerField(default=0)
    REQUIRED_FIELDS = ['name']
    USERNAME_FIELD = 'email'

class Note(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255)
    body = models.TextField()
    summary = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    action_items = models.JSONField(default=list, blank=True)
    suggested_title = models.CharField(max_length=255, blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    is_archived = models.BooleanField(default=False)
    is_shared = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title