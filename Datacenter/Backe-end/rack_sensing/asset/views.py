import datetime
# from django.shortcuts import render
# Create your views here.
import json

from django.db import transaction
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from alert.models import Alert, AssetLocationChange
from alert.serializers import RealTimeAlertSerializer
from common.models import FloorMap
from rack_monitor.models import Rack
from rack_monitor.serializers import RackTempMaxSerializer, RackHumiMaxSerializer, RackEnergyMaxSerializer
from .models import Asset, AssetTracking, HotSpotEnergyEvent, \
    AssetLocationTracking, GhostAvg, AssetTrackingHistory
from .serializers import AssetSerializer, EventSerializer, AssetDetailsSerilaizer, AssetLocationSerializer, \
    AssetHistorySerializer, GhostHistorySerializer
from django.db.models import Sum, F, Q, Count
from django.db.models import Avg, Max, Min
import datetime


# import pandas as pd


class AssetAPI(APIView):
    """ API for Asset to get  all the asset details based on floor
      required paramter is {"id": floorid}
      if id == 0 --> it will give from all the floors all asset details
      if id == presented floor id it will give all the asset details from all the floors
     """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        try:
            id = request.GET.get("id")
            print("id is -----------------------------", id)
            tagid = request.GET.get('tagid')
            if id is not None:
                if int(id) == 0:
                    asts = Asset.objects.filter(deregisteredStatus=False).prefetch_related('placedIn').order_by(
                        '-lastseen')
                    if asts:
                        serializer = AssetDetailsSerilaizer(asts, many=True)
                        return Response(serializer.data, status=status.HTTP_200_OK)
                    else:
                        return Response([], status=status.HTTP_200_OK)
                elif int(id) != 0:
                    floor = FloorMap.objects.filter(id=id).first()
                    ast = Asset.objects.filter(floor=floor, deregisteredStatus=False).order_by('-lastseen')
                    if ast:
                        serializer = AssetSerializer(ast, many=True)
                        return Response(serializer.data, status=status.HTTP_200_OK)
                    else:
                        return Response([], status=status.HTTP_200_OK)
                else:
                    return Response([], status=status.HTTP_200_OK)

            elif tagid is not None:
                ast = Asset.objects.filter(id=tagid).first()
                stratTime = datetime.datetime.now()
                endTime = stratTime - datetime.timedelta(minutes=2)
                if ast:
                    hotspot = HotSpotEnergyEvent.objects.filter(timestamp__startswith=stratTime.date(), tagid=ast,
                                                                event=1).count()
                    coldspot = HotSpotEnergyEvent.objects.filter(timestamp__startswith=stratTime.date(), tagid=ast,
                                                                 event=2).count()
                    highpowerEvent = HotSpotEnergyEvent.objects.filter(timestamp__startswith=stratTime.date(),
                                                                       tagid=ast, event=3).count()
                    print("hotspot", hotspot, coldspot, highpowerEvent)
                    alerts = Alert.objects.raw(
                        "select distinct(value), id, endTime, temperature,humidity,energy from alert_alert  where endTime>='" + str(
                            endTime) + "' and macid_id=" + str(ast.id) + " group by value")

                    alertSerializer = RealTimeAlertSerializer(alerts, many=True)
                    serializer = AssetSerializer(ast)
                    dataDict = {}
                    for key, value in serializer.data.items():
                        dataDict['' + str(key)] = value
                    dataDict['alerts'] = alertSerializer.data
                    dataDict['hotspot'] = hotspot
                    dataDict['coldspot'] = coldspot
                    dataDict['highpowerevent'] = highpowerEvent
                    return Response(dataDict, status=status.HTTP_200_OK)
                else:
                    return Response({}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide asset or floor id's"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    """ POST method to register new asset """

    @staticmethod
    def post(request):
        """ This POST Request is used for Registering an Asset
                  Required Parameters are floor id and
                  rackno is a rackid which registred in the database
                  usage Asset usage space under that rack in the form units
                  assetsn, datacenter,description,devicemodel,manufacturer,assetunitusage,
                  supplier, address,macaddr, macaddr2,equpimentcategory,weight, inventorycode, tagid, tempmax, tempmin,energymax,voltage

              """
        try:
            floor_id = request.data.get('floor')
            floor = FloorMap.objects.filter(id=floor_id).first()
            data = request.data
            tagid = data['tagid']

            if floor:
                rk = Rack.objects.filter(id=request.data.get('rackno')).first()
                if rk:
                    object = Asset.objects.filter(tagid=tagid, deregisteredStatus=False).first()
                    if object is None:
                        usage = Asset.objects.filter(placedIn=rk, deregisteredStatus=False).aggregate(Sum('usage'))
                        cap = 0
                        if usage['usage__sum'] is not None:
                            cap = usage['usage__sum']
                        # print(data['assetunitusage'])
                        if cap + int(data['assetunitusage']) <= rk.capacity:
                            ast = Asset()
                            ast.assetsn = data['assetsn']
                            ast.datacenter = data['datacenter']
                            ast.description = data['description']
                            ast.devicemodel = data['devicemodel']
                            # ast.floor = FloorMap.objects.filter(id=data['floorid']).first()
                            ast.manufacturer = data['manufacturer']
                            ast.usage = int(data['assetunitusage'])
                            ast.rooms = data['rooms']
                            ast.serialnumber = request.data.get("serialnumber")
                            ast.rackno = rk
                            ast.placedIn = rk
                            ast.columns = data['columns']
                            # ast.location = data['assetsn']
                            ast.supplier = data['supplier']
                            ast.address = request.data.get("address")
                            ast.macaddr = request.data.get("macaddr")
                            ast.macaddr2 = request.data.get("macaddr2")
                            ast.category = request.data.get("equpimentcategory")
                            ast.weight = request.data.get("weight")
                            ast.inventorycode = request.data.get("inventorycode")
                            ast.lifecycle = request.data.get("lifecycle")
                            ast.power = request.data.get("power")
                            ast.maintenancestaffemail = request.data.get("staffemail")
                            ast.maintenancecycle = request.data.get("maintenancecycle")
                            ast.current = request.data.get("current")
                            ast.maintenancestaffname = request.data.get("staffname")
                            ast.principal = request.data.get("principal")
                            ast.voltage = request.data.get("voltage")
                            ast.name = request.data.get("name")
                            ast.tempMax = request.data.get('tempmax')
                            ast.tempMin = request.data.get('tempmin')
                            ast.energyMax = request.data.get('energymax')
                            ast.floor = floor

                            if len(request.data.get("lastupdatedtime")):
                                ast.lastupdatedtime = datetime.datetime.strptime(
                                    data['lastupdatedtime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                            ast.maintenancecontact = request.data.get("staffcontact")

                            if len(data['firstusetime']):
                                ast.firstusetime = datetime.datetime.strptime(
                                    data['firstusetime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                            if len(data['nextupdatedtime']):
                                ast.nextupdatedtime = datetime.datetime.strptime(
                                    data['nextupdatedtime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                            ast.tagid = data['tagid']
                            ast.x = 0.0
                            ast.y = 0.0
                            ast.battery = 0.0
                            ast.registerTime = datetime.datetime.now()
                            ast.save()
                            return Response(status=status.HTTP_201_CREATED)
                        else:
                            return Response({"capacity": int(rk.capacity) - int(usage['usage__sum'])},
                                            status=status.HTTP_406_NOT_ACCEPTABLE)
                    else:
                        return Response({"message": "asset already registred"}, status=status.HTTP_208_ALREADY_REPORTED)
                else:
                    return Response({"message": "Rack not found"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"message": "Floor not found"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    """ DELETE method to delete/remove particular asset tag"""

    @staticmethod
    def delete(request):
        """DELETE method to delete/remove particular asset tag
                 Its Required Parameter called tagid which has to represents mac address of an Asset
             """
        try:
            ast = Asset.objects.filter(tagid=request.data.get("tagid"), deregisteredStatus=False).last()
            if ast:
                ast.deregisteredStatus = True
                ast.deregisterTime = datetime.datetime.now()
                ast.save()
                return Response(status=status.HTTP_200_OK)
            return Response({"message": str(ast) + " tagid is not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """ This Patch Request update the Asset details
                 its required a parameter called tagid which respresents macaddres of an asset
             """
        try:
            floor_id = request.data.get('floor')
            floor = FloorMap.objects.filter(id=floor_id).first()
            rk = Rack.objects.filter(macid=request.data.get('rackno')).first()
            data = request.data
            tagid = data['tagid']
            if floor:
                if rk:
                    ast = Asset.objects.filter(tagid=tagid, deregisteredStatus=False).first()
                    if ast:
                        usage = Asset.objects.filter(placedIn=rk, deregisteredStatus=False).aggregate(Sum('usage'))
                        cap = 0
                        if usage['usage__sum'] is not None:
                            cap = usage['usage__sum']
                        # print(data['assetunitusage'])
                        if cap + int(data['assetunitusage']) <= rk.capacity:
                            # ast = Asset()
                            ast.assetsn = data['assetsn']
                            ast.datacenter = data['datacenter']
                            ast.description = data['description']
                            ast.devicemodel = data['devicemodel']
                            # ast.floor = FloorMap.objects.filter(id=data['floorid']).first()
                            ast.manufacturer = data['manufacturer']
                            ast.usage = data['assetunitusage']
                            ast.rooms = data['rooms']
                            ast.serialnumber = request.data.get("serialnumber")
                            ast.rackno = rk
                            ast.placedIn = rk
                            ast.columns = data['columns']
                            # ast.location = data['assetsn']
                            ast.supplier = data['supplier']
                            ast.address = request.data.get("address")
                            ast.macaddr = request.data.get("macaddr")
                            ast.macaddr2 = request.data.get("macaddr2")
                            ast.category = request.data.get("equpimentcategory")
                            ast.weight = request.data.get("weight")
                            ast.inventorycode = request.data.get("inventorycode")
                            ast.lifecycle = request.data.get("lifecycle")
                            ast.power = request.data.get("power")
                            ast.lastmaintenancestaff = request.data.get("lastmaintenancestaff")
                            ast.maintenancecycle = request.data.get("maintenancecycle")
                            ast.current = request.data.get("current")
                            ast.nextmaintenance = request.data.get("nextmaintenancestaff")
                            ast.principal = request.data.get("principal")
                            ast.voltage = request.data.get("voltage")
                            ast.name = request.data.get("name")
                            ast.tempMax = request.data.get('tempmax')
                            ast.tempMin = request.data.get('tempmin')
                            ast.energyMax = request.data.get('energymax')
                            ast.floor = floor

                            if len(request.data.get("lastupdatedtime")):
                                ast.lastupdatedtime = datetime.datetime.strptime(
                                    data['lastupdatedtime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                            ast.maintenancecontact = request.data.get("maintenancecontact")

                            if len(data['firstusetime']):
                                ast.firstusetime = datetime.datetime.strptime(
                                    data['firstusetime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                            if len(data['nextupdatedtime']):
                                ast.nextupdatedtime = datetime.datetime.strptime(
                                    data['nextupdatedtime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                            ast.tagid = data['tagid']
                            ast.x = 0.0
                            ast.y = 0.0
                            ast.battery = 0.0
                            ast.registerTime = datetime.datetime.now()
                            # ast.deregisteredStatu
                            ast.save()
                            return Response(status=status.HTTP_200_OK)
                        else:
                            return Response({"capacity": int(rk.capacity) - int(usage['usage__sum'])},
                                            status=status.HTTP_406_NOT_ACCEPTABLE)
                    else:
                        return Response({"message": "asset is not registered"}, status=status.HTTP_400_BAD_REQUEST)
                return Response({"message": "please provide the proper rack "}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Floor not found "}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)


class NewMonitorStatusAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """GET method accept 1 query parameter {id:"floor id"}
        it sends under that floor how many rack registered with
        details of rack(X,Y co-ordinates, capacity of rack etc.) and Alerts of Rack"""
        try:
            id = request.GET.get("id")
            print(id)
            if id is not None and int(id) == 0:
                print("inside if condition")
                racks = Rack.objects.all().order_by('-timestamp')
                payload = self.dataFramePayalod(racks)
                return Response({"asset": payload}, status=status.HTTP_200_OK)
            elif id is not None and int(id) != 0:
                print("else condition")
                floor = FloorMap.objects.filter(id=int(id)).first()
                if floor:
                    racks = Rack.objects.filter(floor=floor).order_by('id')
                    payload = self.dataFramePayalod(racks)
                    return Response({"asset": payload}, status=status.HTTP_200_OK)
                else:
                    return Response({"asset": []}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide id"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

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
                    alerts = Alert.objects.raw(
                        "select distinct(value), id, endTime, temperature,humidity,energy from alert_alert  where endTime>='" + str(
                            endTime) + "' and  rack_id=" + str(rack.id) + " group by value")

                    alertSerializer = RealTimeAlertSerializer(alerts, many=True)
                    rackCapcity = {}
                    if assets['usage__sum'] > rack.capacity:
                        rackCapcity["value"] = 1
                        rackCapcity["lastseen"] = rack.timestamp
                        rackCapcity["temperature"] = 0
                        rackCapcity["humidity"] = 0
                        rackCapcity["energy"] = 0

                    if len(alertSerializer.data):
                        if len(rackCapcity) > 0:
                            dataList = []
                            for row in alertSerializer.data:
                                dataList.append(row)
                            dataList.append(rackCapcity)

                            object = self.getData(rack, assets, len(alertSerializer.data), dataList,
                                                  available, utilization)
                            payload.append(object)
                        else:
                            object = self.getData(rack, assets, len(alertSerializer.data), alertSerializer.data,
                                                  available, utilization)
                            payload.append(object)
                    else:
                        if len(rackCapcity) > 0:
                            object = self.getData(rack, assets, 1, [rackCapcity], available, utilization)
                            payload.append(object)
                        else:
                            object = self.getData(rack, assets, 0, [], available, utilization)
                            payload.append(object)
                else:

                    payload.append(
                        {"rack": rack.macid, "rackid": rack.id, "available": rack.capacity, "count": 0,
                         "capacity": rack.capacity,
                         "usage": 0, "utilization": 0, "name": rack.name, "x": rack.x, "y": rack.y,
                         "x1": rack.x1,
                         "y1": rack.y1, "alert": 0, "alerts": [], "timestamp": rack.timestamp})

        return payload

    def getData(self, rack, assets, countAlert, dataList, available, utilization):
        """ it will return dictinary objects witha all the necessary details """

        return {"rack": rack.macid, "rackid": rack.id, "available": available, "count": assets['id__count'],
                "capacity": rack.capacity,
                "usage": assets['usage__sum'], "utilization": utilization, "name": rack.name, "x": rack.x,
                "y": rack.y,
                "x1": rack.x1,
                "y1": rack.y1, "alert": countAlert, "alerts": dataList,
                "timestamp": rack.timestamp}


class AssetTrackingHistoryAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    # @staticmethod
    def get(self, request):
        """ GET method is used to retrieve requested asset-id's records """
        try:
            tag = request.GET.get("id")
            key = request.GET.get('key')
            # currDate = datetime.datetime.today().date()
            asset = Asset.objects.filter(id=tag).first()
            print(asset, asset.id)
            if asset:
                if key == "assettempmax":
                    result = self.tempMax(asset)
                    return Response(result, status=status.HTTP_200_OK)
                elif key == "assethumimax":
                    result = self.rackHumiMax(asset)
                    return Response(result, status=status.HTTP_200_OK)
                elif key == "assetenergymax":
                    print("inside asset enerygy")
                    result = self.rackEnergyMax(asset)
                    return Response(result, status=status.HTTP_200_OK)
                else:
                    return Response([], status=status.HTTP_200_OK)
            else:
                return Response([], status=status.HTTP_200_OK)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def tempMax(self, asset):
        """ This Function Returns the Asset Max Temperature of every Minute of Today"""

        objects = AssetTracking.objects.raw(
            "select max(tempf) temp,id,date_format(lastseen-interval minute(lastseen)%%1 minute, '%%Y-%%m-%%d %%H:%%i') as time from asset_assettracking where tagid_id=" + str(
                asset.id) + " and lastseen>=CURDATE() group by time;")
        serializer = RackTempMaxSerializer(objects, many=True)
        return serializer.data

    def rackHumiMax(self, asset):
        """ This Function Returns the Asset Max Humidity of every Minute of Today"""

        objects = AssetTracking.objects.raw(
            "select max(humidityf) humidity,id,date_format(lastseen-interval minute(lastseen)%%1 minute, '%%Y-%%m-%%d %%H:%%i') as time from asset_assettracking where tagid_id=" + str(
                asset.id) + " and lastseen>=CURDATE() group by time;")
        serializer = RackHumiMaxSerializer(objects, many=True)
        return serializer.data

    def rackEnergyMax(self, asset):
        """ This Function Returns the Asset Max Energy of every Minute of Today"""
        objects = AssetTracking.objects.raw(
            "select max(energy)/1000 energy,id,date_format(lastseen-interval minute(lastseen)%%1 minute, '%%Y-%%m-%%d %%H:%%i') as time from asset_assettracking where tagid_id=" + str(
                asset.id) + " and lastseen>=CURDATE() group by time;")
        serializer = RackEnergyMaxSerializer(objects, many=True)
        return serializer.data


class SystemStatusAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """ GET method retrieve all racks server capacity,
        summary of asset, sensor (Temp/Humi),GhostServer Count
        energy tag"""
        try:
            id = int(request.GET.get("id"))
            startTime = datetime.datetime.now()
            endTime = startTime - datetime.timedelta(minutes=2)
            print(endTime)
            if id is not None:
                date = datetime.datetime.strptime(str(datetime.datetime.now().today().date()) + " 00:00:00",
                                                  "%Y-%m-%d %H:%M:%S")
                if int(id) != 0:
                    floor = FloorMap.objects.filter(id=id).first()
                    if floor:
                        racks = Rack.objects.filter(floor=floor).aggregate(Count('id'), Sum('capacity'))
                        if racks['id__count'] > 0:
                            missing_assets = Asset.objects.filter(floor=floor, deregisteredStatus=False,
                                                                  lastseen__lte=date).aggregate(Count('id'))
                            asset = Asset.objects.filter(floor=floor, deregisteredStatus=False).aggregate(Max('tempf'),
                                                                                                          Max('humidityf'),
                                                                                                          Max('energy'),
                                                                                                          Count('id'))
                            ghost = Asset.objects.filter(ghostCount__gte=16000, deregisteredStatus=False).aggregate(
                                Count('id'))
                            alert = Alert.objects.filter(floor=floor, lastseen__gte=endTime,
                                                         endTime__lte=startTime).aggregate(Count('id'))
                            print("---------", alert)
                            alertpositionCount = AssetLocationChange.objects.filter(floor=floor, timestamp__gte=endTime,
                                                                                    timestamp__lte=startTime).count()
                            count = 0
                            if alertpositionCount > 0:
                                count = alertpositionCount
                            elif alert['id__count'] > 0:
                                count = alert['id__count']
                            else:
                                pass
                            data = self.getData(racks, asset, ghost['id__count'], missing_assets['id__count'], count)
                            if data:
                                return Response(data, status=status.HTTP_200_OK)
                            else:
                                return Response(
                                    {"temp": 0, "humidity": 0, "energy": 0, "asset_count": 0, "rack_capacity": 0,
                                     "ghost": 0, "rack_count": 0, "missing_assets": missing_assets['id__count'],
                                     "alert_count": alert['id__count']}, status=status.HTTP_200_OK)
                        else:
                            return Response(
                                {"temp": 0, "humidity": 0, "energy": 0, "asset_count": 0, "rack_capacity": 0,
                                 "ghost": 0, "rack_count": 0, "missing_assets": 0, "alert_count": 0},
                                status=status.HTTP_200_OK)
                elif id == 0:
                    racks = Rack.objects.aggregate(Count('id'), Sum('capacity'))
                    print("-----------------------racks", racks)
                    if racks['id__count']:
                        if racks['id__count'] > 0:
                            missing_assets = Asset.objects.filter(deregisteredStatus=False, lastseen__lte=date).aggregate(
                                Count('id'))
                            asset = Asset.objects.filter(deregisteredStatus=False).aggregate(Max('tempf'), Max('humidityf'),
                                                                                             Max('energy'), Count('id'))
                            ghost = Asset.objects.filter(ghostCount__gte=60, deregisteredStatus=False).aggregate(
                                Count('id'))
                            alert = Alert.objects.filter(lastseen__gte=endTime, endTime__lte=startTime).aggregate(
                                Count('id'))
                            alertpositionCount = AssetLocationChange.objects.filter(timestamp__gte=endTime,
                                                                                    timestamp__lte=startTime).count()
                            count = 0

                            print("alert--------------", alertpositionCount, alert['id__count'])
                            if alertpositionCount > 0:
                                count = alertpositionCount
                            elif alert['id__count'] > 0:
                                count = alert['id__count']
                            else:
                                pass
                            data = self.getData(racks, asset, ghost['id__count'], missing_assets['id__count'], count)
                            if data:
                                return Response(data, status=status.HTTP_200_OK)
                            else:
                                return Response(
                                    {"temp": 0, "humidity": 0, "energy": 0, "asset_count": 0, "rack_capacity": 0,
                                     "ghost": 0, "rack_count": 0, "missing_assets": 0, "alert_count": 0},
                                    status=status.HTTP_200_OK)
                        else:
                            return Response(
                                {"temp": 0, "humidity": 0, "energy": 0, "asset_count": 0, "rack_capacity": 0,
                                 "ghost": 0, "rack_count": 0, "missing_assets": 0, "alert_count": 0},
                                status=status.HTTP_200_OK)
                    else:
                        return Response(
                            {"temp": 0, "humidity": 0, "energy": 0, "asset_count": 0, "rack_capacity": 0, "ghost": 0,
                             "rack_count": 0, "missing_assets": 0, "alert_count": 0}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "please provide id"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"message": "please provide id"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print("error-----------", err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def getData(self, rack, asset, ghost, missing_assets, alert):
        energy = 0

        if asset['energy__max']:
            if asset['energy__max'] > 0.0:
                energy = asset['energy__max'] / 1000
            return {"temp": asset['tempf__max'], "humidity": asset['humidityf__max'], "energy": energy,
                    "asset_count": asset['id__count'], "rack_capacity": rack['capacity__sum'], "ghost": ghost,
                    "rack_count": rack['id__count'], "missing_assets": missing_assets, "alert_count": alert}

        return {"temp": 0, "humidity": 0, "energy": energy,
                "asset_count": asset['id__count'], "rack_capacity": rack['capacity__sum'], "ghost": ghost,
                "rack_count": rack['id__count'], "missing_assets": missing_assets, "alert_count": alert}


class RackTempAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """GET method retrieve Maximum temp and humidity of group assets registered under all Racks as well as
             forwarding difference in temperature and humidity as compared with previous record """
        try:
            id = request.GET.get('id')
            print("id is ------", id)
            if id and int(id) != 0:
                floor = FloorMap.objects.filter(id=int(id)).first()
                racks = Rack.objects.filter(floor=floor)
                payload = self.createData(racks)
                return Response(payload, status=status.HTTP_200_OK)
            elif int(id) == 0:
                racks = Rack.objects.all()
                payload = self.createData(racks)
                return Response(payload, status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide id"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def createData(self, racks):
        payload = []
        curDate = datetime.datetime.now().date()
        for rack in racks:
            asset = Asset.objects.filter(placedIn=rack, deregisteredStatus=False,
                                         lastseen__startswith=curDate).aggregate(Max('tempf'), Max('humidityf'),
                                                                                 Max('energy'))
            astavg = AssetTracking.objects.filter(rack=rack).order_by('-id')[:2]
            if len(astavg) == 2:
                if astavg:
                    tempDiff = astavg[0].tempf - astavg[1].tempf
                    humidityDiff = astavg[0].humidityf - astavg[1].humidityf
                    energyDiff = (astavg[0].energy - astavg[1].energy) / 1000
                else:
                    tempDiff = 0
                    humidityDiff = 0
                    energyDiff = 0

                if asset['tempf__max'] and asset['humidityf__max'] and asset['energy__max']:
                    payload.append(
                        {"id": rack.id, "macid": rack.macid, "name": rack.name, "temp": asset['tempf__max'],
                         'energy': asset['energy__max'] / 1000,
                         "humidity": asset['humidityf__max'],
                         "tempdiff": tempDiff, "humiditydiff": humidityDiff, 'energydiff': energyDiff})
                else:
                    payload.append(
                        {"id": rack.id, "macid": rack.macid, "name": rack.name, "temp": 0, "humidity": 0, "energy": 0,
                         "tempdiff": tempDiff,
                         "humiditydiff": humidityDiff, "energydiff": energyDiff})
            else:
                if asset['tempf__max'] and asset['humidityf__max'] and asset[
                    'energy__max']:
                    payload.append(
                        {"id": rack.id, "macid": rack.macid, "name": rack.name, "temp": asset['tempf__max'],
                         "humidity": asset['humidityf__max'],
                         "energy": asset['energy__max'] / 1000,
                         "tempdiff": 0,
                         "humiditydiff": 0,
                         "energydiff": 0})
                else:
                    payload.append(
                        {"id": rack.id, "macid": rack.macid, "name": rack.name, "temp": 0, "humidity": 0, "energy": 0,
                         "tempdiff": 0,
                         "humiditydiff": 0, "energydiff": 0})

        return payload


class AssetTempAPI(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """ POST method takes from user 2 range parameter/values (from and to) on that bases it sends asset data """
        try:

            id = request.GET.get('id')
            print("id is -----------------", id, type(id))
            if id is not None and int(id) != 0:
                # print("inside------------", id)
                floor = FloorMap.objects.filter(id=int(id)).first()
                assets = Asset.objects.filter(floor=floor, deregisteredStatus=False)
                payload = self.createData(assets)
                return Response(payload, status=status.HTTP_200_OK)
            elif int(id) == 0:
                print("elif condition from assettemp")
                assets = Asset.objects.filter(deregisteredStatus=False)
                payload = self.createData(assets)
                return Response(payload, status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide id"}, status=status.HTTP_200_OK)
        except Exception as err:
            print("error from assetemp------------", err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def createData(self, assets):
        payload = []
        for row in assets:
            # print(row.tagid)
            assttracking = AssetTracking.objects.filter(tagid=row).order_by('-id')[:2]
            if assttracking:
                if len(assttracking) == 2:
                    tempDiff = assttracking[0].tempf - assttracking[1].tempf
                    humidityDiff = assttracking[0].humidityf - assttracking[1].humidityf
                    energyDiff = (assttracking[0].energy - assttracking[1].energy) / 1000
                    payload.append(
                        {"id": row.id, "tagid": row.tagid, "name": row.name, "temp": row.tempf,
                         "humidity": row.humidityf,
                         "energy": row.energy / 1000,
                         "tempdiff": tempDiff,
                         "humidityDiff": humidityDiff, "energydiff": energyDiff})
                else:
                    payload.append(
                        {"id": row.id, "tagid": row.tagid, "name": row.name, "temp": row.tempf,
                         "humidity": row.humidityf,
                         "energy": row.energy / 1000
                            , "tempdiff": "",
                         "humidityDiff": "", "energydiff": ""})
            else:
                pass
        return payload


class EventAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            id = request.GET.get('id')
            event = request.GET.get('key')
            asset = Asset.objects.filter(id=id).first()
            today = datetime.datetime.today().date()
            if asset and event == "1" or event == "2" or event == "3":
                objects = HotSpotEnergyEvent.objects.filter(tagid=asset, endTime__gte=today, event=event)
                serializer = EventSerializer(objects, many=True)
                payload = []
                count = 0
                for row in serializer.data:
                    count = count + 1
                    payload.append({"eventValue": count, "lastseen": row['timestamp']})
                return Response(payload, status=status.HTTP_200_OK)
            elif asset and event == "location":
                assets = AssetLocationTracking.objects.filter(tagid=asset).prefetch_related('rack', 'tagid').order_by(
                    '-endTime')
                serializer = AssetLocationSerializer(assets, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            elif asset and event == "energy":
                data = AssetTracking.objects.filter(tagid=asset, lastseen__startswith=today).annotate(
                    energy_diff=F('energy') / 1000).values('energy_diff', 'lastseen')
                return Response(data, status=status.HTTP_200_OK)
            elif asset and event:
                data = AssetTracking.objects.filter(tagid=asset, lastseen__startswith=today).values(event, 'lastseen')
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response([], status=status.HTTP_200_OK)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_200_OK)


class GhostAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # dataList = []
            id = request.GET.get('id')
            if id is not None:
                if int(id) != 0:
                    floor = FloorMap.objects.filter(id=int(id)).first()
                    if floor:
                        objects = Asset.objects.filter(floor=floor, ghostCount__gte=16000, deregisteredStatus=False)[
                                  :50]
                        if objects:
                            data = self.getData(objects)
                            return Response(data, status=status.HTTP_200_OK)
                        else:
                            return Response([], status=status.HTTP_200_OK)
                    else:
                        return Response([], status=status.HTTP_200_OK)
                elif int(id) == 0:
                    objects = Asset.objects.filter(ghostCount__gte=16000, deregisteredStatus=False)
                    if objects:
                        data = self.getData(objects)
                        return Response(data, status=status.HTTP_200_OK)
                    else:
                        return Response([], status=status.HTTP_200_OK)
                else:
                    return Response([], status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide id"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_200_OK)

    def getData(self, objects):
        dataList = []
        for object in objects:
            # print(object.tagid)
            if object.ghostStart:
                print("dsaste--------------------", object.ghostStart.date())
                str_date = str(object.ghostStart)[:11]
                # print(str_date, "-strdate -------------------------------")
                # date = datetime.datetime.strptime(str_date, "%Y-%m-%d")
                # print(date)
                asset = GhostAvg.objects.filter(lastseen__gte=object.ghostStart.date(), tagid=object).aggregate(Avg('power'))
                power = 0
                ghoststatus = 'ON'
                if asset['power__avg']:
                    power = asset['power__avg']
                if object.ghostStatus == 1:
                    ghoststatus = 'OFF'
                data = {'id': object.id, 'name': object.name, 'make': '',
                        'model': object.devicemodel,
                        'rack': object.placedIn.name,
                        'location': object.location, 'power': power, 'deviation': 0,
                        'status': ghoststatus}

                dataList.append(data)

        return dataList

    def patch(self, request):
        try:
            id = request.data.get('id')
            gstatus = request.data.get('status')
            print("patrch request gghost ------------",  id, gstatus)
            object = Asset.objects.filter(id=id).first()
            if object:
                if gstatus == "ON":
                    object.ghostStatus = 0
                elif gstatus == "OFF":
                    object.ghostStatus = 1
                else:
                    pass
                object.save()
                return Response(status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)


class ServerMaintenance(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            name = request.data.get("name")
            inventory = request.data.get('inventory')
            assets = Asset.objects.filter(deregisteredStatus=False, nextmaintenance=name, inventorycode=inventory)
            # print("assets", assets)
            if assets:
                print(assets.count())
                serializer = AssetSerializer(assets, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide proper name and inventory code"},
                                status=status.HTTP_406_NOT_ACCEPTABLE)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        try:
            id = request.data.get('id')
            gstatus = request.data.get('status')
            dt = datetime.datetime.now()
            # print(request.data, id, gstatus)
            object = Asset.objects.filter(id=id).first()
            if object:
                if gstatus == "ON":
                    print("ON---", gstatus)
                    object.maintenanceStatus = 1
                    object.maintenanceStart = dt
                    object.save()
                elif gstatus == "OFF":
                    print("OFF---", gstatus)
                    object.maintenanceStatus = 0
                    object.maintenanceEnd = dt
                    object.save()
                else:
                    pass
                # object.save()
                return Response(status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)


class BulkAssetRegistrationAPI(APIView):

    def post(self, request):
        try:
            data = request.data
            bulk_list = []
            if data:
                with transaction.atomic():
                    for row in data:
                        # print(row)
                        rk = Rack.objects.filter(macid=row['rackno']).first()
                        floor = FloorMap.objects.filter(id=row['floor']).first()
                        if rk and floor:
                            usage = Asset.objects.filter(placedIn=rk, deregisteredStatus=False).aggregate(Sum('usage'))
                            # row = row
                            cap = 0
                            if usage['usage__sum'] is not None:
                                cap = usage['usage__sum']
                            # print(row['assetunitusage'])
                            if cap + int(row['assetunitusage']) <= rk.capacity:
                                ast = Asset()
                                ast.assetsn = row['assetsn']
                                ast.datacenter = row['datacenter']
                                ast.description = row['description']
                                ast.devicemodel = row['devicemodel']
                                # ast.floor = FloorMap.objects.filter(id=row['floorid']).first()
                                ast.manufacturer = row['manufacturer']
                                ast.usage = row['assetunitusage']
                                ast.rooms = row['rooms']
                                ast.serialnumber = row["serialnumber"]
                                ast.rackno = rk
                                ast.placedIn = rk
                                ast.columns = row['columns']
                                # ast.location = row['assetsn']
                                ast.supplier = row['supplier']
                                ast.address = row["address"]
                                ast.macaddr = row["macaddr"]
                                ast.macaddr2 = row["macaddr2"]
                                ast.category = row["equpimentcategory"]
                                ast.weight = 0.0
                                ast.inventorycode = row["inventorycode"]
                                ast.lifecycle = row["lifecycle"]
                                ast.power = 0.0
                                ast.maintenancestaffname = row["staffname"]
                                ast.maintenancecycle = row["maintenancecycle"]
                                ast.current = row["current"]
                                ast.maintenancestaffemail = row["staffemail"]
                                ast.principal = row["principal"]
                                ast.voltage = 0.0
                                ast.name = row["name"]
                                ast.tempMax = 50.0
                                ast.tempMin = 10
                                ast.energyMax = 415
                                ast.floor = floor

                                if len(row["lastupdatedtime"]):
                                    ast.lastupdatedtime = datetime.datetime.strptime(
                                        row['lastupdatedtime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                                ast.maintenancecontact = row["staffcontact"]

                                if len(row['firstusetime']):
                                    ast.firstusetime = datetime.datetime.strptime(
                                        row['firstusetime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                                if len(row['nextupdatedtime']):
                                    ast.nextupdatedtime = datetime.datetime.strptime(
                                        row['nextupdatedtime'].replace('T', ' ') + str(':00'), "%Y-%m-%d %H:%M:%S")

                                ast.tagid = row['tagid']
                                ast.x = 0.0
                                ast.y = 0.0
                                ast.battery = 0.0
                                # ast.save()
                                bulk_list.append(ast)
                    Asset.objects.bulk_create(bulk_list)
            return Response(status=status.HTTP_200_OK)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)


class AssetHistory(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            id = request.GET.get('tagid')
            if id:
                asset = Asset.objects.filter(id=id).first()
                if asset:
                    history = AssetTrackingHistory.objects.filter(tagid=asset)
                    if history:
                        serialzer = AssetHistorySerializer(history, many=True)
                        return Response(serialzer.data, status=status.HTTP_200_OK)
                    else:
                        return Response([], status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Asset id is not Acceptable"}, status=status.HTTP_406_NOT_ACCEPTABLE)
            else:
                return Response({"message": "please forward tagid"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)


class GhostHistory(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            id = request.GET.get('tagid')
            if id:
                asset = Asset.objects.filter(id=id).first()
                if asset:
                    if asset.ghostStart:
                        # str_date = str(object.ghostStart)[:11]
                        # date = datetime.datetime.strptime(str_date, "%Y-%m-d")
                        ghost = GhostAvg.objects.filter(lastseen__gte=asset.ghostStart.date(), tagid=asset)
                        if ghost:
                            serializer = GhostHistorySerializer(ghost, many=True)
                            return Response(serializer.data, status=status.HTTP_200_OK)
                        else:
                            return Response([], status=status.HTTP_200_OK)
                    else:
                        return Response([], status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Asset not found"}, status=status.HTTP_406_NOT_ACCEPTABLE)
            else:
                return Response({"message": "please provide a tagid"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)
