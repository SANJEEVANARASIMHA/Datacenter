from django.db import models
# Create your models here.
from common.models import FloorMap
from rack_monitor.models import Rack
from django.utils import timezone


class Asset(models.Model):
    """ Model for Asset"""

    assetsn = models.CharField(max_length=100)  # ---
    datacenter = models.CharField(max_length=100)  # --
    description = models.CharField(max_length=150, null=True)
    devicemodel = models.CharField(max_length=100)  # ---
    floor = models.ForeignKey(FloorMap, on_delete=models.CASCADE, default=1)
    manufacturer = models.CharField(max_length=100, null=True)
    usage = models.IntegerField(max_length=50, null=True)
    rooms = models.CharField(max_length=100)  # ---
    serialnumber = models.CharField(max_length=100, null=True)
    rackno = models.ForeignKey(Rack, related_name="rackno", null=True, on_delete=models.SET_NULL)
    removedFrom = models.ForeignKey(Rack, related_name="removed", null=True, default=None, on_delete=models.SET_NULL)
    placedIn = models.ForeignKey(Rack, related_name="placed", null=True, default=None, on_delete=models.SET_NULL)
    columns = models.CharField(max_length=30)  # ---
    supplier = models.CharField(max_length=100, null=True)
    address = models.CharField(max_length=100, null=True)
    macaddr = models.CharField(max_length=40, null=True)  # ---
    macaddr2 = models.CharField(max_length=40, null=True)
    category = models.CharField(max_length=20, null=True)
    weight = models.FloatField(default=0.0, null=True)
    inventorycode = models.CharField(max_length=50, null=True)
    lifecycle = models.CharField(max_length=100, null=True)
    power = models.FloatField(default=0.0, null=True)
    maintenancestaffemail = models.CharField(max_length=100, null=True)
    maintenancecycle = models.CharField(max_length=100, null=True)
    current = models.FloatField(max_length=10, null=True)
    maintenancestaffname = models.CharField(max_length=100, null=True)
    principal = models.CharField(max_length=100, null=True)
    voltage = models.FloatField(null=True)
    lastupdatedtime = models.DateTimeField(default=None, null=True)
    maintenancecontact = models.CharField(max_length=12, null=True)
    firstusetime = models.DateTimeField(null=True, blank=True)
    nextupdatedtime = models.DateTimeField(default=None, null=True)
    tagid = models.CharField(max_length=40, null=False)
    lastseen = models.DateTimeField(auto_now=True)
    energy = models.FloatField(default=None, null=True)
    location = models.IntegerField(default=0, null=True)
    tempf = models.FloatField(default=None, null=True)
    humidityf = models.FloatField(default=None, null=True)
    tempb = models.FloatField(default=None, null=True)
    humidityb = models.FloatField(default=None, null=True)
    battery = models.FloatField(default=None, null=True)
    name = models.CharField(max_length=200, null=False)
    hotspot = models.FloatField(default=0.0, null=True)
    coldspot = models.FloatField(default=0.0, null=True)
    highpowerevent = models.FloatField(default=0.0, null=True)
    tempMax = models.FloatField(default=0.0)
    tempMin = models.FloatField(default=0.0)
    energyMax = models.FloatField(default=0.0)
    ghostCount = models.IntegerField(default=0)
    ghostStatus = models.IntegerField(default=0)
    ghostStart = models.DateTimeField(default=None, null=True)
    registerTime = models.DateTimeField(default=None, null=True)
    deregisterTime = models.DateTimeField(default=None, null=True)
    deregisteredStatus = models.BooleanField(default=False)
    alertSms = models.IntegerField(default=0)
    alertTime = models.DateTimeField(default=None, null=True)
    maintenanceStatus = models.IntegerField(default=1)
    maintenanceStart = models.DateTimeField(default=None, null=True)
    maintenanceEnd = models.DateTimeField(default=None, null=True)


class AssetTracking(models.Model):
    """ This table is used to store the and every change of temperature humidity and energy of an asset"""

    tagid = models.ForeignKey(Asset, on_delete=models.CASCADE)
    tempf = models.FloatField()
    humidityf = models.FloatField()
    tempb = models.FloatField()
    humidityb = models.FloatField()
    power = models.FloatField()
    energy = models.FloatField()
    # utilisation = models.FloatField()
    lastseen = models.DateTimeField()
    rack = models.ForeignKey(Rack, null=True, on_delete=models.CASCADE)
    battery = models.FloatField(default=0.0)
    current = models.FloatField(default=0.0)
    voltage = models.FloatField(default=0.0)
    location = models.IntegerField(default=0)
    floor = models.ForeignKey(FloorMap, null=True, on_delete=models.CASCADE)


class HotSpotEnergyEvent(models.Model):
    """ This table is used to store the hotspot, cold spot and energy event time duration """
    tagid = models.ForeignKey(Asset, on_delete=models.CASCADE)
    rack = models.ForeignKey(Rack, null=True, on_delete=models.CASCADE)
    event = models.IntegerField()
    eventValue = models.FloatField()
    timestamp = models.DateTimeField(default=None)
    endTime = models.DateTimeField(auto_now_add=True)


class AssetLocationTracking(models.Model):
    """ This Table is used to store tracking of an asset location and its duration """
    tagid = models.ForeignKey(Asset, on_delete=models.CASCADE)
    rack = models.ForeignKey(Rack, null=True, on_delete=models.CASCADE)
    location = models.IntegerField(default=0)
    startTime = models.DateTimeField(default=None)
    endTime = models.DateTimeField(default=None)


class AssetTrackingHistory(models.Model):
    """ This table is used to store the each and every changes of temperature humidity and energy of an asset"""

    tagid = models.ForeignKey(Asset, on_delete=models.CASCADE)
    tempf = models.FloatField()
    humidityf = models.FloatField()
    tempb = models.FloatField()
    humidityb = models.FloatField()
    power = models.FloatField()
    energy = models.FloatField()
    # utilisation = models.FloatField()
    lastseen = models.DateTimeField()
    rack = models.ForeignKey(Rack, null=True, on_delete=models.CASCADE)
    battery = models.FloatField(default=0.0)
    current = models.FloatField(default=0.0)
    voltage = models.FloatField(default=0.0)
    location = models.IntegerField(default=0)
    floor = models.ForeignKey(FloorMap, null=True, on_delete=models.CASCADE)


class GhostAvg(models.Model):
    tagid = models.ForeignKey(Asset, on_delete=models.CASCADE)
    tempf = models.FloatField()
    humidityf = models.FloatField()
    tempb = models.FloatField()
    humidityb = models.FloatField()
    power = models.FloatField()
    energy = models.FloatField()
    lastseen = models.DateTimeField()
    rack = models.ForeignKey(Rack, null=True, on_delete=models.CASCADE)
    battery = models.FloatField(default=0.0)
    current = models.FloatField(default=0.0)
    voltage = models.FloatField(default=0.0)
    ghostCount = models.IntegerField(default=0)
    floor = models.ForeignKey(FloorMap, null=True, on_delete=models.CASCADE)
