from abc import ABC
from rest_framework import serializers
from common.serializers import MapSerializer
from rack_monitor.serializers import RackSerializer, RackPlacedInSerializer
from .models import Asset, AssetTracking, HotSpotEnergyEvent, AssetLocationTracking, AssetTrackingHistory, GhostAvg


class AssetSerializer(serializers.ModelSerializer):
    """ Serializer for Asset model"""

    floor = MapSerializer()
    rackno = RackPlacedInSerializer()
    placedIn = RackPlacedInSerializer()

    class Meta:
        model = Asset
        fields = '__all__'


class AssetDetailsSerilaizer(serializers.ModelSerializer):
    # rackno = RackPlacedInSerializer()
    placedIn = RackPlacedInSerializer()

    class Meta:
        model = Asset
        fields = ['id', 'name', 'placedIn', 'usage', 'lastseen', 'battery', 'tagid']


class AssetStatusSerializer(serializers.ModelSerializer):
    """ Serializer for Asset model"""

    # floor = MapSerializer()
    # rackno = RackSerializer()

    class Meta:
        model = Asset
        fields = ['tagid', 'tempf', 'humidityf', 'lastseen', 'rackno']


class AssetAlertSerializer(serializers.ModelSerializer):
    rackno = RackSerializer()

    class Meta:
        model = Asset
        fields = ['tagid', 'rackno', 'name', 'placedIn', 'battery']


class AssetRacknoSerializer(serializers.ModelSerializer):
    rackno = RackPlacedInSerializer()

    class Meta:
        model = Asset
        fields = ['tagid', 'rackno', 'name', 'placedIn', 'battery']


class AssetTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'


class ThermalTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'tagid', 'lastseen', 'location', 'tempf', 'humidityf', 'tempb', 'humidityb', 'name']


class EnergyTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'tagid', 'lastseen', 'location', 'power', 'current', 'voltage', 'name']


class MonitorSatusSerializer(serializers.Serializer):
    rack = serializers.CharField()
    name = serializers.CharField()
    usage = serializers.IntegerField()
    capacity = serializers.IntegerField()
    count = serializers.IntegerField()
    available = serializers.IntegerField()
    x = serializers.FloatField()
    y = serializers.FloatField()
    x1 = serializers.FloatField()
    y1 = serializers.FloatField()


class AssetFrontSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['tempf', 'humidityf', 'lastseen']


class AssetBackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['tempb', 'humidityb', 'lastseen']


class AssetTrackingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetTracking
        fields = '__all__'


class AssetCountSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    timestamp = serializers.DateTimeField()


class AssetMaxTempSerializer(serializers.Serializer):
    status = serializers.FloatField()
    id = serializers.IntegerField()
    placedIn_id = serializers.IntegerField()


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotSpotEnergyEvent
        fields = '__all__'


class AssetLocationSerializer(serializers.ModelSerializer):
    """ Serializer for Asset model"""

    # floor = MapSerializer()
    rack = RackPlacedInSerializer()
    tagid = AssetDetailsSerilaizer()

    class Meta:
        model = AssetLocationTracking
        fields = '__all__'


class AssetAlertLocationSerializer(serializers.ModelSerializer):
    """ Serializer for Asset model"""

    rack = RackPlacedInSerializer()
    tagid = AssetDetailsSerilaizer()

    class Meta:
        model = AssetLocationTracking
        fields = '__all__'

class AssetHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetTrackingHistory
        fields = '__all__'

class GhostHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GhostAvg
        fields = '__all__'