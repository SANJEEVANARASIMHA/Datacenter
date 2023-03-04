from rest_framework import serializers
from asset.serializers import AssetAlertSerializer, AssetRacknoSerializer, AssetSerializer
from rack_monitor.serializers import RackSerializer, RackPlacedInSerializer
from .models import Alert, AlertImage, AssetLocationChange


class AlertSerializer(serializers.ModelSerializer):
    """ Serializer for Alert model"""
    macid = AssetAlertSerializer()
    rack = RackSerializer()

    class Meta:
        model = Alert
        fields = '__all__'


class AlertAssetSerializer(serializers.ModelSerializer):
    macid = AssetRacknoSerializer()
    rack = RackPlacedInSerializer()

    class Meta:
        model = Alert
        fields = ['macid', 'rack', 'temperature', 'energy', 'humidity', 'lastseen', 'endTime']


class AlertImageSerializer(serializers.ModelSerializer):
    # macid = AssetAlertSerializer()

    class Meta:
        model = AlertImage
        fields = '__all__'


class AlertHistorySerializer(serializers.Serializer):
    count = serializers.IntegerField()
    date = serializers.DateField()


class RackAlertSerializer(serializers.Serializer):
    rack = RackSerializer()
    macid = AssetSerializer()
    temperature = serializers.FloatField()
    humidity = serializers.FloatField()
    energy = serializers.FloatField()
    lastseen = serializers.DateTimeField()
    timestamp = serializers.DateTimeField()
    # endTime = serializers.DateTimeField()


class AlertCountSerializer(serializers.Serializer):
    status = serializers.IntegerField()
    id = serializers.IntegerField()


class RealTimeAlertSerializer(serializers.Serializer):
    """ Serializer for Alert model"""
    endTime = serializers.DateTimeField()
    # lastseen = serializers.DateTimeField()
    value = serializers.IntegerField()
    temperature = serializers.FloatField()
    humidity = serializers.FloatField()
    energy = serializers.FloatField()
    # macid = serializers.IntegerField()
    # rack_id = serializers.IntegerField()


class AlertCountSerializer(serializers.Serializer):
    status = serializers.IntegerField()
    id = serializers.IntegerField()


class AssetLocationChangeSerializer(serializers.ModelSerializer):
    macid = AssetAlertSerializer()

    class Meta:
        model = AssetLocationChange
        fields = '__all__'
