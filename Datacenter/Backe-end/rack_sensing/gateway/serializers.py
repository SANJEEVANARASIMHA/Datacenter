from rest_framework import serializers

from common.serializers import MapSerializer
from gateway.models import MasterGateway, SlaveGateway


""" Serializer for MasterGateway Model """
class MasterSerializer(serializers.ModelSerializer):
    floor = MapSerializer()
    
    class Meta:
        model = MasterGateway
        fields = "__all__"
        
    
""" Serializer for SlaveGateway Model """
class SlaveSerializer(serializers.ModelSerializer):
    master = MasterSerializer()
    
    class Meta:
        model = SlaveGateway
        fields = "__all__"    
        
