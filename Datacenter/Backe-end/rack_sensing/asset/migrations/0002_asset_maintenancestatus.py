# Generated by Django 3.1.6 on 2023-02-02 17:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asset', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='asset',
            name='maintenanceStatus',
            field=models.IntegerField(default=0, null=True),
        ),
    ]
