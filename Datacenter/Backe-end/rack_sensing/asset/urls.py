from rest_framework.urls import path
from . import views

urlpatterns = [
    path('asset', views.AssetAPI.as_view()),
    path('rack/monitor', views.NewMonitorStatusAPI.as_view()), # this   url is used in real time tracking page to
    # plot racks with alerts
    path('asset/chart', views.AssetTrackingHistoryAPI.as_view()),
    path('systemstatus', views.SystemStatusAPI.as_view()),  # This URL is useful to home Page
    path('racktemp', views.RackTempAPI.as_view()),
    path('assettemp', views.AssetTempAPI.as_view()),
    path('asset/event', views.EventAPIView.as_view()),
    path('bulk', views.BulkAssetRegistrationAPI.as_view()),
    path('asset/ghost', views.GhostAPIView.as_view()),
    path('asset/server/maintenance', views.ServerMaintenance.as_view()),
    path('ghost/history', views.GhostHistory.as_view())
]