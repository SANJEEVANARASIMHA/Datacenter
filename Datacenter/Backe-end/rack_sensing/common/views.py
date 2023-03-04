from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from asset.models import Asset
from asset.serializers import AssetDetailsSerilaizer
from common.models import FloorMap
from common.serializers import MapSerializer
from gateway.models import MasterGateway, SlaveGateway
from gateway.serializers import MasterSerializer, SlaveSerializer


# from apilogger import logger


class LoginAPI(APIView):
    @staticmethod
    def post(request):
        username = request.data.get("username")
        password = request.data.get("password")
        try:
            user = list(User.objects.filter(username=username))
            if len(user) != 0:
                user = authenticate(request, username=user[0].username, password=password)
                if user is not None:
                    login(request, user)
                    return Response({"success": " Welcome back {}".format(user)}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "password is wrong "}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({"error": "username is wrong"}, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_404_NOT_FOUND)


class LogoutAPI(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        try:
            logout(request)
            return Response(status=status.HTTP_200_OK)
        except Exception as err:
            return Response({"error :": str(err)}, status=status.HTTP_400_BAD_REQUEST)


#
# class UploadMap(APIView):
#     authentication_classes = [SessionAuthentication]
#     permission_classes = [IsAuthenticated]
#
#     @staticmethod
#     def get(request):
#         """ GET method to retrieve all information about floor map """
#         maps = FloorMap.objects.all()
#         serializer = MapSerializer(maps, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
#
#     @staticmethod
#     def post(request):
#         """ POST method to upload floor map """
#         try:
#             mapSerializer = MapSerializer(data=request.data)
#             # print('------->', request.data, mapSerializer.is_valid())
#             if mapSerializer.is_valid():
#                 # print('======',mapSerializer.data)
#                 mapSerializer.save()
#                 return Response(mapSerializer.data, status=status.HTTP_201_CREATED)
#             else:
#                 # print(mapSerializer.errors)
#                 return Response(mapSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#         except Exception as err:
#             print(err)
#             return Response(status=status.HTTP_400_BAD_REQUEST)


class FloorMapAPI(APIView):
    """ API for FloorMap model """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """ GET method to retrieve all floor map details """

        try:
            maps = FloorMap.objects.all()
            serializer = MapSerializer(maps, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as err:
            return Response({"Error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        """ POST method to store floor map image with its name, height and width """
        try:
            mapSerializer = MapSerializer(data=request.data)
            if mapSerializer.is_valid():
                mapSerializer.save()
                return Response(mapSerializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(mapSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print(err)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """ GET method to retrieve all floor map details """

        try:
            id = request.data.get('id')
            maps = FloorMap.objects.filter(id=id).first()
            if maps:
                maps.delete()
                return Response(status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as err:
            print(err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)


class HealthAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            id = request.GET.get('id')
            if id is not None:
                if int(id) != 0:
                    floor = FloorMap.objects.filter(id=id).first()
                    if floor:
                        master = MasterGateway.objects.filter(floor=floor).first()
                        print("master--", master)
                        if master:
                            masterSerializer = MasterSerializer(master)
                            slaves = SlaveGateway.objects.filter(master=master)
                            print("---------slaves", slaves)
                            slaveserializer = SlaveSerializer(slaves, many=True)
                            asts = Asset.objects.filter(floor=floor, deregisteredStatus=False).prefetch_related(
                                'placedIn').order_by(
                                '-lastseen')
                            assetSerializer = AssetDetailsSerilaizer(asts, many=True)
                            return Response({"master": [masterSerializer.data], "slave": slaveserializer.data,
                                             "asset": assetSerializer.data}, status=status.HTTP_200_OK)
                        return Response({"master": [], "slave": [], "asset": []}, status=status.HTTP_200_OK)
                    return Response({"master": [], "slave": [], "asset": []}, status=status.HTTP_200_OK)
                else:
                    data = MasterGateway.objects.all()
                    masterSerializer = MasterSerializer(data, many=True)
                    data = SlaveGateway.objects.all()
                    slaveserializer = SlaveSerializer(data, many=True)
                    asts = Asset.objects.filter(deregisteredStatus=False).prefetch_related('placedIn').order_by(
                        '-lastseen')
                    assetSerializer = AssetDetailsSerilaizer(asts, many=True)
                    return Response(
                        {"master": masterSerializer.data, "slave": slaveserializer.data, "asset": assetSerializer.data},
                        status=status.HTTP_200_OK)
            else:
                return Response({"message": "please provide an id"}, status=status.HTTP_200_OK)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)


class UserCredentialTest(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    @staticmethod
    def post(request):
        username = request.data.get("username")
        password = request.data.get("password")
        try:
            user = list(User.objects.filter(username=username))
            if len(user) != 0:
                user = authenticate(request, username=user[0].username, password=password)
                if user is not None:
                    # login(request, user)
                    return Response({"success": " User Credentials Correct".format(user)}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "password is wrong "}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({"error": "username is wrong"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_404_NOT_FOUND)
