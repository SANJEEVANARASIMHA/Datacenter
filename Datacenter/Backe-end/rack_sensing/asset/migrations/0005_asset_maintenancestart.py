# Generated by Django 3.1.6 on 2023-02-06 16:39

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asset', '0004_auto_20230206_1505'),
    ]

    operations = [
        migrations.AddField(
            model_name='asset',
            name='maintenanceStart',
            field=models.DateTimeField(default=datetime.datetime(2023, 2, 6, 16, 39, 58, 592577)),
        ),
    ]