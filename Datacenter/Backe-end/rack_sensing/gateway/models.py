from django.db import models
from common.models import FloorMap


class MasterGateway(models.Model):
    """ MasterGateway model:
        stores gatewayid, floor id for which it is registered """
    gatewayid = models.CharField(unique=True, max_length=20)
    floor = models.ForeignKey(FloorMap, on_delete=models.CASCADE)
    lastseen = models.DateTimeField(auto_now=True) 


class SlaveGateway(models.Model):
    """ SlaveGateway model:
        stores gatewayid, master id under which it is registered """
    gatewayid = models.CharField(unique=True, max_length=20)
    master = models.ForeignKey(MasterGateway, on_delete=models.CASCADE)
    lastseen = models.DateTimeField(auto_now=True)
