import base64
import json
import mysql.connector
import logging.handlers
import time
import datetime
import paho.mqtt.client as mqtt
from PIL import Image

""" MQTT """
# BROKER_ENDPOINT = "192.168.0.99"
BROKER_ENDPOINT = "psa.vacustech.in"
TOPIC = "vacus/test"
PORT = 1883

# floor

""" Database configuration """
DB_USERNAME = "vacus"
DB_PASSWORD = "vacus"
DB_NAME = "yokta2"

""" Creating Database Object"""
db = mysql.connector.connect(
    host="localhost",
    user=DB_USERNAME,
    password=DB_PASSWORD,
    database=DB_NAME
)


# The callback for when the client receives a CANNOCK response from the server.
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))

    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe(TOPIC)
    # The callback for when a PUBLISHING message is received from the server.


def on_message(client, userdata, msg):
    logger.info("Data received!!")
    """ Message Payload is binary buffer due to that we are decoding """
    serializedJson = msg.payload.decode('utf-8')
    jsonData = json.loads(serializedJson)
    store_data(jsonData)


# inserting data into tracking table
def insert_data(jsonData, similarity, image_path, date, cursor):
    """ inserting data into tracking table """
    sql = """ INSERT INTO alert_alertimage (image, timestamp) VALUES (%s, %s) """
    val = (image_path, date)
    cursor.execute(sql, val)
    db.commit()


def store_image(img, dt):
    # Create a file with write byte permission and store to local storage
    f = open('/home/sanjeeva/Vacus/YoktaUpdatingChanges/rack_sensing/static/cam/' + str(dt) + '.jpg', "wb")
    f.write(img)
    print("Image Received")
    f.close()

    im = Image.open('/home/sanjeeva/Vacus/YoktaUpdatingChanges/rack_sensing/static/cam/' + str(dt) + '.jpg')
    # rotate image
    angle = 0
    out = im.rotate(angle)
    out.save('/home/sanjeeva/Vacus/YoktaUpdatingChanges/rack_sensing/static/cam/' + str(dt) + '.jpg')


def store_data(jsonData):
    cursor = db.cursor()
    dt = datetime.datetime.now()
    img = base64.b64decode(jsonData['img'])
    image_path = 'static/cam/' + str(dt) + '.jpg'
    epoch = jsonData['timestamp']
    similarity = round(float(jsonData['similarity']) * 100)

    # Calling store_image function
    if img:
        store_image(img, dt)

    print(type(similarity), similarity)
    print(type(epoch), jsonData['CAM_ID'], jsonData['similarity'], jsonData['Np'], type(jsonData['similarity']))
    date = datetime.datetime.strptime(jsonData['timestamp'], '%Y-%m-%d %H:%M:%S.%f')

    # date = datetime.datetime.fromtimestamp(int(epoch)).strftime('%Y-%m-%d %H:%M:%S')
    print(type(date), date)

    # Calling insert_data function
    if cursor:
        insert_data(jsonData, similarity, image_path, date, cursor)

    cursor.close()


def on_disconnect(client, userdata, rc):
    if rc != 0:
        # logger.info("Disconnection from broker, Reconnecting...")
        print("disconnection")
        systemcon()
        client.subscribe(TOPIC)  # subscribe topic test


def systemcon():
    st = 0
    try:
        st = client.connect(BROKER_ENDPOINT, PORT)  # establishing connection
    except:
        st = 1
    finally:
        if st != 0:
            # logger.info("Connection failed, Reconnecting...")
            print("connection failed")
            time.sleep(5)
            systemcon()


if __name__ == "__main__":
    # with open('../logs/tracking.yaml', 'r') as stream:
    #     logger_config = yaml.load(stream, yaml.FullLoader)
    # logging.config.dictConfig(logger_config)
    logger = logging.getLogger('Tracking')

    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    systemcon()
    # client.connect(BROKER_ENDPOINT, 1883, 60)
    client.subscribe(TOPIC)
    client.loop_forever()
