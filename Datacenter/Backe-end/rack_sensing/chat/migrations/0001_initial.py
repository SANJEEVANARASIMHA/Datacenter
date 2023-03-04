# Generated by Django 3.1.6 on 2023-01-30 15:12

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField()),
                ('message', models.CharField(max_length=2000)),
                ('user', models.CharField(default='admin', max_length=100)),
            ],
        ),
    ]