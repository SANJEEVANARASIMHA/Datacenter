from django.db import models

# Create your models here.

class Chat(models.Model):
    timestamp = models.DateTimeField()
    message = models.CharField(max_length=2000)
    user = models.CharField(max_length=100, default="admin")