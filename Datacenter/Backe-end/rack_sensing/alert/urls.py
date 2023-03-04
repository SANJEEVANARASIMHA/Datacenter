from rest_framework.urls import path
from . import views

urlpatterns = [
    # URL for alert(get)
    path('alert', views.AlertAPI.as_view()),
    path('alert/asset', views.AssetAlertAPI.as_view()),
    path('image', views.AlertImageApi.as_view()),
    path('alert/history', views.AlertHistoryAPI.as_view()),
]
