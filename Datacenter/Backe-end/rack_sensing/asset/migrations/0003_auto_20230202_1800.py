# Generated by Django 3.1.6 on 2023-02-02 18:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asset', '0002_asset_maintenancestatus'),
    ]

    operations = [
        migrations.AlterField(
            model_name='asset',
            name='maintenanceStatus',
            field=models.BooleanField(default=0),
        ),
    ]