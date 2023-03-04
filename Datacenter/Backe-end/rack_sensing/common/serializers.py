from rest_framework import serializers
from .models import FloorMap


class MapSerializer(serializers.ModelSerializer):
    """ serializer for map table """

    class Meta:
        model = FloorMap
        fields = '__all__'
