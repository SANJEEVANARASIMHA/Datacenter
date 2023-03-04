# Generated by Django 3.1.6 on 2023-02-06 16:40

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asset', '0005_asset_maintenancestart'),
    ]

    operations = [
        migrations.AddField(
            model_name='asset',
            name='maintenanceEnd',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='asset',
            name='maintenanceStart',
            field=models.DateTimeField(default=datetime.datetime(2023, 2, 6, 16, 40, 21, 819655)),
        ),
    ]