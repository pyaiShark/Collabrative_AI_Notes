from .models import Note, User
from rest_framework import serializers

class NoteSerializer(serializers.ModelSerializer):
    content = serializers.CharField(source='body', required=False, allow_blank=True)
    archived = serializers.BooleanField(source='is_archived', required=False)
    public = serializers.BooleanField(source='is_shared', required=False)
    shareId = serializers.CharField(source='id', read_only=True)
    userId = serializers.CharField(source='owner.id', read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'title', 'body', 'content', 'summary', 'tags', 'action_items', 'suggested_title', 'owner', 'userId', 'is_archived', 'archived', 'is_shared', 'public', 'shareId', 'created_at', 'updated_at']
        extra_kwargs = {
            'owner': {'read_only': True},
            'body': {'write_only': True, 'required': False},
            'is_archived': {'write_only': True},
            'is_shared': {'write_only': True}
        }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            name=validated_data.get('name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    