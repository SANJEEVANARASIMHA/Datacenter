from django.db import models
# Create your models here.
from asset.models import Asset
from common.models import FloorMap
from rack_monitor.models import Rack


class Alert(models.Model):
    """ This is table is used to store the temp and humi and energy alerts and freefall alert and its duration of an asset"""

    macid = models.ForeignKey(Asset, on_delete=models.CASCADE)
    value = models.IntegerField()
    lastseen = models.DateTimeField()
    temperature = models.FloatField(default=0)
    humidity = models.FloatField(default=0)
    energy = models.FloatField(default=0)
    rack = models.ForeignKey(Rack, null=True, on_delete=models.CASCADE)
    endTime = models.DateTimeField(auto_now_add=True)
    floor = models.ForeignKey(FloorMap, on_delete=models.CASCADE)


class AlertImage(models.Model):
    image = models.ImageField(upload_to='static/cam/')
    timeStamp = models.DateTimeField()
    # floor = models.ForeignKey(FloorMap, on_delete=models.CASCADE)


class AssetLocationChange(models.Model):
    """ Model for AssetAlert(If that is belongs to rack then insert/generate alert data to this table) """

    macid = models.ForeignKey(Asset, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    removedFrom = models.IntegerField(default=0)
    placedIN = models.IntegerField(default=0)
    rack = models.ForeignKey(Rack, on_delete=models.CASCADE)
    floor = models.ForeignKey(FloorMap, on_delete=models.CASCADE)
