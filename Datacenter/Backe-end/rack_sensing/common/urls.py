from django.urls import path
from . import views


urlpatterns = [
    path('login', views.LoginAPI.as_view()),
    path('logout', views.LogoutAPI.as_view()),
    path('uploadmap', views.FloorMapAPI.as_view()),
    path('health', views.HealthAPIView.as_view()),
    path('user/test', views.UserCredentialTest.as_view()),

]
