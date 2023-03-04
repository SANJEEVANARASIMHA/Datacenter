from django.db import models
from sqlalchemy.sql.functions import mode
# Create your models here.
from common.models import FloorMap


# from asset.models import Asset


class Rack(models.Model):
    macid = models.CharField(max_length=40, unique=True)
    floor = models.ForeignKey(FloorMap, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, unique=True, default=None)
    x = models.FloatField()
    y = models.FloatField()
    x1 = models.FloatField()
    y1 = models.FloatField()
    tempLow = models.FloatField()
    tempHigh = models.FloatField()
    humiLow = models.FloatField(default=0.0)
    humiHigh = models.FloatField(default=0.0)
    capacity = models.FloatField()
    energy = models.FloatField()
    timestamp = models.DateTimeField(auto_now=True, null=True)


class RackWiseAvgTemp(models.Model):
    """Models for to fetch Avg temp/humidity of assets registered under racks"""

    rack = models.ForeignKey(Rack, on_delete=models.CASCADE)
    tempFAvg = models.FloatField(default=0.0)
    tempBAvg = models.FloatField(default=0.0)
    humiFAvg = models.FloatField(default=0.0)
    humiBAvg = models.FloatField(default=0.0)
    energy = models.FloatField(default=0.0)
    maxTemp = models.FloatField(default=0.0)
    minTemp = models.FloatField(default=0.0)
    maxHumi = models.FloatField(default=0.0)
    minHumi = models.FloatField(default=0.0)
    count = models.IntegerField()
    lastseen = models.DateTimeField()


class RackWiseAssetCount(models.Model):
    rack = models.ForeignKey(Rack, on_delete=models.CASCADE)
    count = models.FloatField(default=0.0)
    time = models.DateTimeField(auto_now=True, null=True)
