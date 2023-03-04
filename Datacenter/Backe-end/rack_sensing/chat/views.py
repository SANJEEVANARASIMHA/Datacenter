import datetime

from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import Chat
from chat.serializers import ChatSerializer


# Create your views here.

class ChatAPIView(APIView):
    # authentication_classes = [SessionAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            payload = self.getdata()
            return Response(payload, status=status.HTTP_200_OK)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            print(request.user)
            data = request.data
            timestamp = datetime.datetime.now()
            object = Chat()
            object.user = request.user
            object.message = data['message']
            object.timestamp = timestamp
            object.save()
            # serializer = ChatSerializer(objects, many=True)
            payload = self.getdata()
            return Response(payload, status=status.HTTP_200_OK)
        except Exception as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        try:
            id = int(request.data.get('id'))
            object = Chat.objects.filter(id=id).first()
            if object:
                object.delete()
                payalod = self.getdata()
                return Response(payalod, status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            print("erro-----", err)
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def getdata(self):
        objects = Chat.objects.all().extra(select={'date': 'DATE(timestamp)'}).values('date').distinct().order_by(
            '-timestamp')
        paylaod = []
        result = list(self.removeDuplicates(objects))
        result.sort()

        for row in result:
            # print("----", type(row), row.strftime("%B"), row.day)
            # chats = Chat.objects.filter(timestamp__startswith=row).extra(
            #     select={'timestamp': 'TIME(timestamp)'})
            chats = Chat.objects.filter(timestamp__startswith=row)
            serializer = ChatSerializer(chats, many=True)
            day = row.day
            if day <10:
                day = "0"+str(day)
            paylaod.append({"date": row.strftime("%B")[:3] + " " + str(day), "data": serializer.data})

        # print(paylaod)
        return paylaod

    def removeDuplicates(self, lst):
        payload = list(set([i['date'] for i in lst]))
        return payload
