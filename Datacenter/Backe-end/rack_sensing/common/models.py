from django.db import models

""" Model to store uploaded floor map information.
Information stored is : name, width, height, path """


class FloorMap(models.Model):
    name = models.CharField(unique=True, max_length=60)
    width = models.FloatField()
    height = models.FloatField()
    image = models.ImageField(upload_to='static/tracking/')
