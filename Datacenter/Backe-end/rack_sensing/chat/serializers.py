from rest_framework import serializers

from chat.models import Chat


class ChatSerializer(serializers.ModelSerializer):
    """Serializer for Rack model"""

    class Meta:
        model = Chat
        fields = ['id', 'timestamp', 'message']
