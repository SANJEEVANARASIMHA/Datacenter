from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from asset.models import AssetLocationTracking
from asset.serializers import AssetLocationSerializer
from common.models import FloorMap
from .models import Alert, AlertImage, AssetLocationChange
from .serializers import AlertSerializer, AlertImageSerializer, AlertHistorySerializer, \
    AlertAssetSerializer, RackAlertSerializer, AssetLocationChangeSerializer
from rest_framework import status
from rest_framework.response import Response
import datetime


class AlertAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    """GET method for retrieve all alert details"""

    @staticmethod
    def get(request):
        """ This Get Request Returns the currentDate Alerts in the reversing order based on Timestamp
                 Required Parameters are key called value

                 if value == 8 returns the Temerature alerts
                 if value == 9 returns the HUmidity alerts
                 if value == 10 returns the energy alerts

             """
        try:
            value = request.GET.get("value")
            currentDate = datetime.date.today().strftime("%Y-%m-%d")
            print(currentDate)
            id = request.GET.get('id')
            if id is not None:
                if int(id) == 0:
                    alerts = Alert.objects.filter(value=value, endTime__startswith=currentDate).order_by(
                        '-endTime').prefetch_related('rack', 'macid')
                    serializer = AlertAssetSerializer(alerts, many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    floor = FloorMap.objects.filter(id=id).first()
                    alerts = Alert.objects.filter(floor=floor, value=value, endTime__startswith=currentDate).order_by(
                        '-endTime').prefetch_related('rack', 'macid')
                    serializer = AlertAssetSerializer(alerts, many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide the id"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)


class AssetAlertAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        """ This GET request Returns the Asset Tracking Details.
             The Asset Tracking location from one Rcak to Another Rack
         """
        try:
            id = request.GET.get('id')
            if id is not None:
                if int(id) != 0:
                    floor = FloorMap.objects.filter(id=id).first()
                    assets = AssetLocationChange.objects.filter(floor=floor).order_by('-timestamp')
                    serializer = AssetLocationChangeSerializer(assets, many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    assets = AssetLocationChange.objects.all().order_by('-timestamp')
                    serializer = AssetLocationChangeSerializer(assets, many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide the id"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)


class AlertImageApi(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        try:
            data = request.GET.get("time")
            dt = str(data)[0:16]
            dt1 = str(data)[0:19]

            print(dt)
            print("-------------------------------")
            print(dt1)
            # alerts = AlertImage.objects.filter(timeStamp__startswith=dt1).order_by('-id').first()
            first = datetime.datetime.strptime(dt1, "%Y-%m-%d %H:%M:%S")
            last = first - datetime.timedelta(seconds=10)
            alerts = AlertImage.objects.filter(timeStamp__gte=last, timeStamp__lte=first).order_by('-timeStamp').first()
            if alerts:
                alerts = AlertImage.objects.filter(timeStamp__gte=last, timeStamp__lte=first).order_by(
                    '-timeStamp')[:3]
                serializer_current = AlertImageSerializer(alerts, many=True)
                return Response(serializer_current.data, status=status.HTTP_200_OK)
            else:
                alert = AlertImage.objects.filter(timeStamp__startswith=dt).order_by('-timeStamp')[:3]
                if alert:
                    serializer = AlertImageSerializer(alert, many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response([], status=status.HTTP_200_OK)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)


class AlertHistoryAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """ This GET request return count of alerts of every day From last Seven Days"""

        try:
            # import datetime
            id = request.GET.get('id')
            if id is not None:
                dateList = self.appendingDate()
                dateList2 = self.appendingDate()
                data_present = []
                data_present2 = []

                if int(id) != 0:
                    alert = Alert.objects.raw(
                        "select id,count(*) as count, date(lastseen) as date from alert_alert where floor_id=" + str(
                            id) + " and endTime >=DATE_SUB(CURDATE(), INTERVAL 7 DAY) group by date")
                    serializer = AlertHistorySerializer(alert, many=True)
                    positionAlert = AssetLocationChange.objects.raw(
                        "select id,count(*) as count, date(timestamp) as date from alert_assetlocationchange where floor_id=" + str(
                            id) + " and timestamp >=DATE_SUB(CURDATE(), INTERVAL 7 DAY) group by date")

                    serializer2 = AlertHistorySerializer(positionAlert, many=True)
                    payload = self.getData(dateList, data_present, serializer.data)
                    payload2 = self.getData(dateList2, data_present2, serializer2.data)
                    output = self.countAlert(payload, payload2)
                    return Response(output, status=status.HTTP_200_OK)
                elif int(id) == 0:
                    alert = Alert.objects.raw(
                        "select id,count(*) as count, date(lastseen) as date from alert_alert where endTime >=DATE_SUB(CURDATE(), INTERVAL 7 DAY) group by date")
                    serializer = AlertHistorySerializer(alert, many=True)
                    # print("after serializer", serializer.data)
                    positionAlert = AssetLocationChange.objects.raw(
                        "select id,count(*) as count, date(timestamp) as date from alert_assetlocationchange where timestamp >=DATE_SUB(CURDATE(), INTERVAL 7 DAY) group by date")
                    serializer2 = AlertHistorySerializer(positionAlert, many=True)
                    payload = self.getData(dateList, data_present, serializer.data)
                    payload2 = self.getData(dateList2, data_present2, serializer2.data)
                    output = self.countAlert(payload, payload2)
                    return Response(output, status=status.HTTP_200_OK)
                else:
                    return Response([], status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide id"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def getData(self, dateList, data_present, data):
        payload = []
        search = []
        for row in data:
            search.append(dict(row))
            data_present.append(dict(row)["date"])

        for ro in dateList:
            if ro in data_present:
                presented_dict = search[data_present.index(ro)]
                payload.append({"date": ro, "count": presented_dict["count"]})
            else:
                payload.append({"date": ro, "count": 0})
        return payload

    def countAlert(self, payload1, payload2):
        for index1, row in enumerate(payload1):
            for item in payload2:
                if row['date'] == item['date']:
                    payload1[index1]['count'] = int(payload1[index1]['count']) + int(item['count'])
                    # print(payload1[index1]['count'])
        return payload1

    def appendingDate(self):
        lastdate = datetime.datetime.now() - datetime.timedelta(days=7)
        dateList = []
        for i in range(1, 8):
            dateList.append(str(lastdate + datetime.timedelta(days=i))[0:10])
        return dateList
