"""VIPV URLs."""
from django.urls import path

from vipv import views


urlpatterns = [
    path('expt1a', views.expt1a),
    path('save_results/', views.save_results),
    path('validate_captcha/', views.validate_captcha),
    path('ua_data/', views.ua_data),
    path('error', views.error),
    path('data/<str:model>/', views.download_data),
]
