from rest_framework import serializers

from asset.models import AssetTracking
from .models import Rack, RackWiseAvgTemp, RackWiseAssetCount


class RackSerializer(serializers.ModelSerializer):
    """Serializer for Rack model"""

    class Meta:
        model = Rack
        fields = '__all__'


class RackPlacedInSerializer(serializers.ModelSerializer):
    """Serializer for Rack model"""

    class Meta:
        model = Rack
        fields = ['id', 'name', 'macid']


class TempHUmiAvgSerializer(serializers.Serializer):
    """ """

    tempf = serializers.FloatField()
    tempb = serializers.FloatField()
    humidityf = serializers.FloatField()
    humidityb = serializers.FloatField()
    time = serializers.DateTimeField()
    # class Meta:
    #     model = AssetTracking
    #     fields = ['tempf', 'tempb', 'humidityf', 'humidityb', 'time']


class AssetCountSerializer(serializers.Serializer):
    """"""
    count = serializers.IntegerField()
    time = serializers.DateTimeField()


class EnergyCountSerializer(serializers.Serializer):
    energy = serializers.FloatField()
    time = serializers.DateTimeField()

    # class Meta:
    #     model = AssetTracking
    #     fields = ['energy', 'lastseen']


class RackAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rack
        fields = ['macid']


class RackTempMaxSerializer(serializers.Serializer):
    """"""
    temp = serializers.IntegerField()
    time = serializers.DateTimeField()


class RackHumiMaxSerializer(serializers.Serializer):
    """"""
    humidity = serializers.IntegerField()
    time = serializers.DateTimeField()


class RackEnergyMaxSerializer(serializers.Serializer):
    """"""
    energy = serializers.IntegerField()
    time = serializers.DateTimeField()


class RackAssetCountSerializer(serializers.ModelSerializer):
    """Serializer for Rack model"""

    class Meta:
        model = RackWiseAssetCount
        fields = '__all__'
