from django.urls import path

from . import views

app_name = 'gateway'
urlpatterns = [
    # URL for MasterGatewayAPI (get/post/delete/patch)
    path('gateway/master', views.MasterGatewayAPI.as_view()),
    
    # URL for SlaveGatewayAPI (get/post/delete)
    path('gateway/slave', views.SlaveGatewayAPI.as_view()),
]

