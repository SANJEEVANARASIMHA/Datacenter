from django.shortcuts import render

from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.models import FloorMap
from gateway.models import MasterGateway, SlaveGateway
from gateway.serializers import MasterSerializer, SlaveSerializer


class MasterGatewayAPI(APIView):
    """ API for MasterGateway """
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    """ POST method to store details of master gateway with floor it is attached """
    @staticmethod
    def post(request):
        try:
            var = MasterGateway()
            var.gatewayid = request.data.get("macaddress")
            var.floor = FloorMap.objects.get(id=request.data.get("floorid"))
            var.save()
            return Response(status=status.HTTP_201_CREATED)

        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)
            
    """ GET method to retrieve all details """
    @staticmethod
    def get(request):
        try:
            data = MasterGateway.objects.all()
            ser = MasterSerializer(data, many=True)
            return Response(ser.data, status=status.HTTP_200_OK)

        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)
            
    """ DELETE method to delete particular master along with all slaves registered under master """
    @staticmethod
    def delete(request):
        try:
            data = MasterGateway.objects.filter(gatewayid=request.data.get("macaddress"))
            if data:
                data.delete()
                return Response(status=status.HTTP_200_OK)
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    """ PATCH method to update particular master-gateway """
    @staticmethod
    def patch(request):
        try:
            master = MasterGateway.objects.get(gatewayid=request.data.get("macaddress"))
            if request.GET.get("id") == "floor":                
                master.floor = FloorMap.objects.get(id=request.data.get("floorid"))
                master.save()
                return Response(status=status.HTTP_202_ACCEPTED)
            else:
                master.gatewayid = request.data.get("macaddress1")
                master.save()
                return Response(status=status.HTTP_202_ACCEPTED)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)


class SlaveGatewayAPI(APIView):
    """ API for SlaveGateway """
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    """ POST method to store details of slave gateway with master it is attached """
    @staticmethod
    def post(request):
        try:
            master = MasterGateway.objects.get(id=request.data.get("masterid"))
            slave = SlaveGateway()
            slave.gatewayid = request.data.get("macaddress")
            slave.master = master
            slave.save()
            return Response(status=status.HTTP_201_CREATED)

        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
    """ GET method to retrieve all details """
    @staticmethod
    def get(request):
        try:
            data = SlaveGateway.objects.all()
            ser = SlaveSerializer(data, many=True)
            return Response(ser.data, status=status.HTTP_200_OK)

        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)
            
    """ DELETE method to delete particular slave details"""
    @staticmethod
    def delete(request):
        try:
            # print("", request.data.get("macaddress"))
            data = SlaveGateway.objects.filter(gatewayid=request.data.get("macaddress"))
            if data:
                data.delete()
                return Response(status=status.HTTP_200_OK)
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)
