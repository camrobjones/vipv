# Generated by Django 3.2.4 on 2022-09-22 16:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vipv', '0002_auto_20220916_1449'),
    ]

    operations = [
        migrations.AddField(
            model_name='participant',
            name='post_test_modality',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='participant',
            name='post_test_simulation',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='participant',
            name='post_test_variation',
            field=models.TextField(default=''),
        ),
    ]