from rest_framework.urls import path
from . import views
from .views import RackBulkRegistration

urlpatterns = [
    path('rack', views.RackAPI.as_view()),
    path('rack/chart', views.RackWiseTempHumiAPI.as_view()), #real time tracking on click rack and where evere graph chart is need for rack
    path('rack/bulk', RackBulkRegistration.as_view()), #for bulk registration
    path('server/position', views.ServerPositioningAPI.as_view()) #for sever positioning
]
