import datetime
import random
from random import shuffle
from django.db import transaction
from django.db.models import Sum, Avg, Max, Min, Q, Count
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from alert.models import Alert
from alert.serializers import RealTimeAlertSerializer
from asset.models import AssetTracking, Asset
from asset.serializers import AssetTrackingSerializer, ThermalTrackingSerializer, EnergyTrackingSerializer
# from asset.views import NewMonitorStatusAPI
from common.models import FloorMap
from rack_monitor.models import Rack, RackWiseAssetCount
from rack_monitor.serializers import RackSerializer, TempHUmiAvgSerializer, EnergyCountSerializer, \
    RackTempMaxSerializer, RackHumiMaxSerializer, RackEnergyMaxSerializer, RackAssetCountSerializer
# from django.db.models import Prefetch, prefetch_related_objects
# from django.db.models.functions import ExtractYear


class RackAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    """GET method for retrieve details of registered rack_monitor tag """

    def get(self, request):
        try:
            id = request.GET.get("id")
            if id is not None:
                if int(id) != 0:
                    floor = FloorMap.objects.filter(id=id).first()
                    racks = Rack.objects.filter(floor=floor).order_by('-timestamp')
                    payload = self.dataFramePayalod(racks)
                    # serializer = RackSerializer(racks, many=True)
                    return Response(payload, status=status.HTTP_200_OK)
                else:
                    racks = Rack.objects.all().order_by('-timestamp')
                    payload = self.dataFramePayalod(racks)
                    # serializer = RackSerializer(racks, many=True)
                    return Response(payload, status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide floor id "}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print("error-------------", err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def post(request):
        """POST method to register new rack_monitor"""
        try:
            rack = Rack()
            floor = FloorMap.objects.filter(id=request.data.get("floor")).first()
            if floor:
                rack.floor = floor
                rack.macid = request.data.get("macid")
                rack.x = request.data.get("x")
                rack.y = request.data.get("y")
                rack.x1 = request.data.get("x1")
                rack.y1 = request.data.get("y1")
                rack.tempLow = request.data.get("templow")
                rack.tempHigh = request.data.get("temphigh")
                rack.humiLow = request.data.get("humilow")
                rack.humiHigh = request.data.get("humihigh")
                rack.energy = request.data.get("energy")
                rack.capacity = request.data.get("capacity")
                rack.name = request.data.get("name")
                rack.save()
                return Response(status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Floor Not Found"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        except Exception as err:
            print("error---------", err)
            return Response({"error :": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def patch(request):
        """PATCH method to update particular rack_monitor tag"""
        try:
            rck = Rack.objects.get(macid=request.data.get("macid"))
            if rck:
                floor = FloorMap.objects.get(id=request.data.get("floor"))
                if floor:
                    rck.floor = FloorMap.objects.get(id=request.data.get("floor"))
                    rck.x = request.data.get("x")
                    rck.y = request.data.get("y")
                    rck.x1 = request.data.get("x1")
                    rck.y1 = request.data.get("y1")
                    rck.name = request.data.get('name')
                    rck.save()
                    return Response(status=status.HTTP_202_ACCEPTED)
                else:
                    return Response({"message": "Floor Not Found"}, status=status.HTTP_406_NOT_ACCEPTABLE)
            else:
                return Response({"message": "please enter the rack macid properly "},
                                status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def delete(request):
        """DELETE method for delete particular rack_monitor tag"""
        try:
            rck = Rack.objects.filter(macid=request.data.get("macid"))
            if rck:
                rck.delete()
                return Response(status=status.HTTP_200_OK)
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def dataFramePayalod(self, racks):
        """ This function Returns Rack Details with Alerts """

        payload = []
        endTime = datetime.datetime.now() - datetime.timedelta(seconds=15)
        if racks:
            for rack in racks:
                assets = Asset.objects.filter(placedIn=rack, deregisteredStatus=False, lastseen__gte=endTime).exclude(
                    Q(location=0) | Q(location=100)).aggregate(Sum('usage'), Count('id'))
                if assets['usage__sum']:
                    available = int(rack.capacity) - assets['usage__sum']
                    utilization = int(str((assets['usage__sum'] / rack.capacity) * 100).split(".")[0])
                    object = self.getData(rack, assets, available, utilization)
                    payload.append(object)
                else:
                    payload.append(
                        {"id": rack.id, "rack": rack.macid, "rackid": rack.id, "available": rack.capacity, "count": 0,
                         "capacity": rack.capacity,
                         "usage": 0, "utilization": 0, "name": rack.name, "timestamp": rack.timestamp})
        return payload

    def getData(self, rack, assets, available, utilization):
        return {"id": rack.id, "rack": rack.macid, "rackid": rack.id, "available": available,
                "count": assets['id__count'],
                "capacity": rack.capacity,
                "usage": assets['usage__sum'], "utilization": utilization, "name": rack.name,
                "timestamp": rack.timestamp}


class RackWiseTempHumiAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """ This Requesting we are using in RealTime Tracking Page on click of a rack This GET Request Required two Query Parameters called id and key
                   id is macAddress of an Rack
                   if key == asset then it returns the Asset Count of an Asset of a Rack
                   if key ==  thermal Then it returns the Thermla Details of an Asset of Every Minute of Today of Rack
                   if key == energy it returns the energy details of an Asset of every minute of today of Today of Rack
                   if key ==  racktempmax it returns max temp of Rack of every minute of today of Today of Rack
                   if key ==  rackhumimax it returns max HUmi of Rack of every minute of today of Today of Rack
                   if key ==  rackenergymax it returns max Energy of Rack of every minute of today of Today of Rack
               """
        try:
            id = request.GET.get("id")
            key = request.GET.get('key')
            rack = Rack.objects.filter(id=id).first()
            startTime = datetime.datetime.now()
            endTime = startTime - datetime.timedelta(seconds=15)

            if rack:
                assets = Asset.objects.filter(placedIn=rack, deregisteredStatus=False, lastseen__gte=endTime).exclude(
                    Q(location=0) | Q(location=100)).order_by(
                    "-lastseen")
                if key == "asset":
                    # print(assets)
                    result = self.rackAssetCount(rack, assets, endTime)
                    return Response(result, status=status.HTTP_200_OK)
                elif str(key) == "thermal":
                    result = self.rackThermalAvg(rack, assets, endTime)
                    return Response(result, status=status.HTTP_200_OK)
                elif key == "energy":
                    result = self.rackEnery(rack, assets, endTime)
                    return Response(result, status=status.HTTP_200_OK)
                elif key == "racktempmax":
                    result = self.rackTempMax(rack)
                    return Response(result, status=status.HTTP_200_OK)
                elif key == "rackhumimax":
                    result = self.rackHumiMax(rack)
                    return Response(result, status=status.HTTP_200_OK)
                elif key == "rackenergymax":
                    result = self.rackEnergyMax(rack)
                    return Response(result, status=status.HTTP_200_OK)
                else:
                    return Response([], status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def rackAssetCount(self, rack, assets, endTime):
        """ It returns the Asset Count of an rack of every minute of Today"""

        paylaod = []
        objects = RackWiseAssetCount.objects.raw(
            "select * from rack_monitor_rackwiseassetcount where time> CURDATE() and rack_id=" + str(rack.id)+" order by time desc")
        serializer = RackAssetCountSerializer(objects, many=True)
        if assets:
            assetcount = assets.count()
            available = int(rack.capacity) - int(assetcount)
            for asset in assets:
                alerts = self.getAlerts(rack, asset, endTime)
                obj = {}
                alertSerializer = RealTimeAlertSerializer(alerts, many=True)
                serializer1 = AssetTrackingSerializer(asset)
                obj['asset'] = serializer1.data
                obj['alert'] = alertSerializer.data
                obj['id'] = asset.id
                paylaod.append(obj)
            return {"name": rack.name, "data": paylaod, "graph": serializer.data[:3000], "value1": assets.count(),
                    "value2": rack.capacity, "value3": available}
        else:
            return {"name": rack.name, "data": [], "graph": serializer.data, "value1": 0, "value2": rack.capacity,
                    "value3": 42}

    def rackThermalAvg(self, rack, assets, endTime):
        """ it returns thermla data  of Rack of every minute of today"""

        objects = AssetTracking.objects.raw(
            "select avg(tempf) tempf, avg(tempb) tempb, avg(humidityf) humidityf, avg(humidityb) humidityb,id,date_format(lastseen-interval minute(lastseen)%%1 minute, '%%Y-%%m-%%d %%H:%%i') as time from asset_assettracking where rack_id=" + str(
                rack.id) + " and  lastseen>=CURDATE() group by time;")

        payload = []
        serializer = TempHUmiAvgSerializer(objects, many=True)
        astavg = assets.aggregate(Avg('tempf'), Max('tempf'), Min('tempf'))
        if assets:
            for asset in assets:
                alerts = self.getAlerts(rack, asset, endTime)
                obj = {}
                serializer1 = ThermalTrackingSerializer(asset)
                alertSerializer = RealTimeAlertSerializer(alerts, many=True)
                obj['asset'] = serializer1.data
                obj['alert'] = alertSerializer.data
                payload.append(obj)

            if astavg['tempf__avg'] and astavg['tempf__max'] and astavg['tempf__min']:
                return {"name": rack.name, "data": payload, "graph": serializer.data, "value1": astavg['tempf__min'],
                        "value2": astavg['tempf__max'],
                        "value3": astavg['tempf__avg']}
            else:
                return {"name": rack.name, "data": payload, "graph": serializer.data, "value1": 0,
                        "value2": 0,
                        "value3": 0}

        if astavg['tempf__avg'] and astavg['tempf__max'] and astavg['tempf__min']:
            return {"name": rack.name, "data": payload, "graph": serializer.data, "value1": astavg['tempf__min'],
                    "value2": astavg['tempf__max'],
                    "value3": astavg['tempf__avg']}
        else:
            return {"name": rack.name, "data": payload, "graph": serializer.data, "value1": 0,
                    "value2": 0,
                    "value3": 0}

    def rackEnery(self, rack, assets, endTime):
        """ it returns Energy data  of Rack of every minute of today"""

        objects = AssetTracking.objects.raw(
            "select sum(energy)/1000 energy,id,date_format(lastseen-interval minute(lastseen)%%1 minute, '%%Y-%%m-%%d %%H:%%i') as time from asset_assettracking where lastseen>=CURDATE() and rack_id=" + str(
                rack.id) + " group by time;")

        serializer = EnergyCountSerializer(objects, many=True)
        aseetenergy = assets.aggregate(Sum('energy'), Max('energy'), Min('energy'))
        # assetMax = assets.aggregate(Max('power'), Min('power'), Max('current'), Max('voltage'))
        # netPower = (assetMax['power__max'] * assetMax['current__max'] * assetMax['voltage__max']) / 100

        payload = []
        if assets:
            for asset in assets:
                alerts = self.getAlerts(rack, asset, endTime)
                alertSerializer = RealTimeAlertSerializer(alerts, many=True)
                obj = {}
                serializer1 = EnergyTrackingSerializer(asset)
                obj['asset'] = serializer1.data
                obj['alert'] = alertSerializer.data
                payload.append(obj)

            if aseetenergy['energy__max'] and aseetenergy['energy__min']:
                return {"name": rack.name, "data": payload, "graph": serializer.data,
                        "value1": aseetenergy['energy__sum']/1000,
                        "value2": aseetenergy['energy__max']/1000,
                        "value3": aseetenergy['energy__min']/1000}
            else:
                return {"name": rack.name, "data": payload, "graph": serializer.data,
                        "value1": 0,
                        "value2": 0,
                        "value3": 0}

        if aseetenergy['energy__max'] and aseetenergy['energy__min']:
            return {"name": rack.name, "data": payload, "graph": serializer.data, "value1": aseetenergy['energy__sum']/1000,
                    "value2": aseetenergy['energy__max']/1000,
                    "value3": aseetenergy['energy__min']/1000}
        else:
            return {"name": rack.name, "data": payload, "graph": serializer.data,
                    "value1": 0,
                    "value2": 0,
                    "value3": 0}

    def rackTempMax(self, rack):
        """ it returns the Max RackTemp of Every Minute of  today"""

        objects = AssetTracking.objects.raw(
            "select max(tempf) temp,id,date_format(lastseen-interval minute(lastseen)%%1 minute, '%%Y-%%m-%%d %%H:%%i') as time from asset_assettracking where rack_id=" + str(
                rack.id) + " and lastseen>=CURDATE() group by time;")
        serializer = RackTempMaxSerializer(objects, many=True)
        return serializer.data

    def rackHumiMax(self, rack):
        """ it returns the Max RackHUmi of Every Minute of  today"""

        objects = AssetTracking.objects.raw(
            "select max(humidityf) humidity,id,date_format(lastseen-interval minute(lastseen)%%1 minute, '%%Y-%%m-%%d %%H:%%i') as time from asset_assettracking where rack_id=" + str(
                rack.id) + " and lastseen>=CURDATE() group by time;")
        serializer = RackHumiMaxSerializer(objects, many=True)
        return serializer.data

    def rackEnergyMax(self, rack):
        """ it returns the Max RackEnergy of Every Minute of  today"""

        objects = AssetTracking.objects.raw(
            "select max(energy)/1000 energy,id,date_format(lastseen-interval minute(lastseen)%%1 minute, '%%Y-%%m-%%d "
            "%%H:%%i') as time from asset_assettracking where rack_id=" + str(
                rack.id) + " and lastseen>=CURDATE() group by time;")
        serializer = RackEnergyMaxSerializer(objects, many=True)
        return serializer.data

    def getAlerts(self, rack, asset, endTime):
        """ it returns the Alerts of Assets under thhe rack provided"""

        alerts = Alert.objects.raw(
            "select distinct(value), id, lastseen, temperature,humidity,energy from alert_alert  where endTime>='" + str(
                endTime) + "' and  rack_id=" + str(rack.id) + " and macid_id=" + str(
                asset.id) + " group by value")
        return alerts


class ServerPositioningAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @staticmethod
    def post(request):
        try:
            data = request.data
            print("data---------")
            # print(data)
            payload = []
            id =  data['id']
            # print()\
            rackPaylaod = data['rack']
            print("rack-----", rackPaylaod)
            if id is not None:
                if int(id)!=0:
                    floor = FloorMap.objects.filter(id=id).first()
                    if floor:
                        for row in rackPaylaod:
                            rack = Rack.objects.filter(floor=floor, x__gte=row['x'], y__gte=row['y'], x1__lte=row['x1'], y1__lte=row['y1']).first()
                            print(rack)
                            if rack:
                                print(rack.name)
                                Uloc = random.randint(11, 40)
                                payload.append({"id": rack.id , "macid": rack.macid, "name": rack.name, "Uloc": Uloc, "coolerload": 0})
                        return Response(payload, status=status.HTTP_200_OK)
                    else:
                        return Response([], status=status.HTTP_200_OK)
                else:
                    return Response([], status=status.HTTP_200_OK)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)


class RackBulkRegistration(APIView):
    # authentication_classes = [SessionAuthentication]
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        """ This POST Request is for BUlk Registration"""
        try:
            data = request.data
            bulk_list = []
            if data:
                with transaction.atomic():
                    for row in data:
                        rack = Rack()
                        rack.floor = FloorMap.objects.filter(id=row["floor"]).first()
                        rack.macid = row["macid"]
                        rack.x = row["x"]
                        rack.y = row["y"]
                        rack.x1 = row["x1"]
                        rack.y1 = row["y1"]
                        rack.tempLow = row["templow"]
                        rack.tempHigh = row["temphigh"]
                        rack.humiLow = row["humilow"]
                        rack.humiHigh = row["humihigh"]
                        rack.energy = row["energy"]
                        rack.capacity = row["capacity"]
                        rack.name = row["name"]
                        bulk_list.append(rack)
                    Rack.objects.bulk_create(bulk_list)
            return Response(status=status.HTTP_200_OK)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)
