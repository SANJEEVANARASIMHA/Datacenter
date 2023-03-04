#! /usr/bin/python3
import gc
import datetime
import logging
from logging import config, getLogger
import time
import json
import mysql.connector
import mysql.connector.pooling
import paho.mqtt.client as paho
# from memory_profiler import profile
from collections import Counter

import yaml

from sqlqueries1 import masterUpdateQuery, slaveUpdateQuery, rackSelectQuery, rackUpdateQuery, \
    assetSelectQuery, insertAssetTrckingQuery, assetRackWisetHistorySelectQuery, assetRackWiseHistoryInsertQuery, \
    assetRackWiseHistoryUpdateQuery, alertAssetSelectQuery, updateAssetQuery, alertInsert, alertAssetInsertQuery, \
    assettrackingSelectQuery, \
    selectTempAlertQuery, selectHumiAlertQuery, updateTempAlertQuery, \
    selectQueryHotSpotEnergyEvent, selectQueryColdSpotEnergyEvent, selectQueryEnergyEvent, insertHotSpotEnergyEvent, \
    selectEnergyAlertQuery, assetLocationTrackingSelectQuery, assetLocationTrackingUpdateQuery, \
    assetLocationTrackingInsertQuery, updateAlertQuery, updateHotSpotEnergyEvent, insertAssetCountQuery, \
    insertpositionAlertofAsset, masterSelectQuery

dbconfig = {
    "database": "yokta2",
    "user": "vacus",
    "password": "vacus"
}

pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=32,
    pool_reset_session=True,
    **dbconfig)

db = pool.get_connection()

# BROKER_ENDPOINT = "psa.vacustech.in"
BROKER_ENDPOINT = "192.168.1.107"
PORT = 1883
topic = "vacus/datacenter"
select = "select"
update = "update"
many = "many"


def on_message(client, userdata, message):
    """ on sucesssfull subscription of tpoic this on message call back function will invoke"""
    # logger.info("Data received")
    print("data recieved")
    serializedJson = message.payload.decode('utf-8')
    jsonData = json.loads(serializedJson)
    print("data recieved at -----------------------------" + str(datetime.datetime.now()))
    logger.info("data recieved at -----------------------------" + str(datetime.datetime.now()))

    # print(jsonData)
    storeData(jsonData, message.topic)
    print("data processed at ----------------------------", datetime.datetime.now())
    logger.info("data processed at ----------------------------" + str(datetime.datetime.now()))


def queryData(*args):
    # print("length of args ---------", len(args))
    if len(args) == 4:
        query, payload, cursor, db = (args)
        if len(payload):
            result = cursor.executemany(query, payload)
            # print("result is -------------------------", cursor.rowcount)
            db.commit()
            return None
        else:
            return None
    elif len(args) == 5:
        query, value, type, cursor, db = (args)
        if type == "select":
            # print("inside select query")
            cursor.execute(query, value)
            result = cursor.fetchall()
            # print("---------------------", result)
            return result
        elif type == "update":
            cursor.execute(query, value)
            # print("rowww count---", cursor.rowcount)
            db.commit()
            # print("result is -------------------------", cursor.rowcount)
            return None
        else:
            return None
    else:
        return None


def hotcoldspotEnergy(Query, val, select, cursor, db, hotSpotEnergyEventPayload, elem, timeStamp, value,
                      hotSpotEnergyEventUpdatePayload):
    """ it will checks the hotspot and cold spot and Highpower events if its presents with in last two minutes then
    it will update the duration of event """

    hotSpot = queryData(Query, val, select, cursor, db)

    # print("hotspot query result")
    # print(hotSpot)
    if hotSpot:
        if timeStamp <= hotSpot[0]['endTime'] + datetime.timedelta(minutes=2):
            # print("with in two minutes", hotSpot[0]['id'])
            hotSpotEnergyEventUpdatePayload.append((timeStamp, hotSpot[0]['id']))
        else:
            print("not in two minutes")
            hotSpotEnergyEventPayload.append((val[0], val[1], value, elem, timeStamp, timeStamp))
            print("appended")
    else:
        print("else part")
        hotSpotEnergyEventPayload.append((val[0], val[1], value, elem, timeStamp, timeStamp))


def tempHumiEnergyAlertInsert(tagid, rackid, present, timeStamp, type, alertInsertPayload, humiAlertResult,
                              alertUpadtePayload, floor_id):
    """ This Function appends the  temp, humi and energy alerts if its found  with in two minutes """

    if timeStamp <= humiAlertResult['endTime'] + datetime.timedelta(minutes=2):
        alertUpadtePayload.append((timeStamp, humiAlertResult['id']))
    else:
        if type == "temp":
            alertInsertPayload.append(
                (8, timeStamp, tagid, 0, present, 0, rackid, timeStamp, floor_id))
        elif type == "humi":
            alertInsertPayload.append(
                (9, timeStamp, tagid, present, 0, 0, rackid, timeStamp, floor_id))
        elif type == "energy":
            alertInsertPayload.append(
                (10, timeStamp, tagid, 0, 0, present, rackid, timeStamp, floor_id))
        # print("humi alert is not presented with in two minutes so appended")


def removeDuplicates(lst, timeStamp):
    """Removes the duplicates from the given list and appends timestamp each unique item"""
    payload = list(set([i[1] for i in lst]))
    payload1 = []
    for row in payload:
        payload1.append((timeStamp, row))
    return payload1


def rackCountfunc(racks, timeStamp):
    assetCountInsertPayload = []
    if len(racks):
        a = dict(Counter(racks))
        print(a)
        for keys, value in a.items():
            print(keys, value)
            assetCountInsertPayload.append((keys, value, timeStamp))
    return assetCountInsertPayload


def addTimestamp(payload, timeStamp):
    payload1 = []
    for row in payload:
        payload1.append((timeStamp, row))
    return payload1


def findRack(asset, racks):
    for rack in racks:
        if rack['macid'] == asset['rack']:
            return rack


def findAsset(asset, assets):
    for item in assets:
        if item['tagid'] == asset['id']:
            return item


def assetLocationTrackFunc(assetLocationResult, rackid, tagid, timeStamp, elem, assetLocationInsertPayload,
                           assetLocationUpdatePayload, assetPositionChangeInsertPayload, floor_id):
    """ this function will chcek the asset track the asset duration of location """
    if assetLocationResult:
        if assetLocationResult[0]['rack_id'] == rackid and assetLocationResult[0]['tagid_id'] == tagid and \
                assetLocationResult[0]['location'] == int(
            elem['uLoc']) and assetLocationResult[0]['endTime'] <= timeStamp + datetime.timedelta(minutes=2):
            print("if condition is true")
            assetLocationUpdatePayload.append((timeStamp, assetLocationResult[0]['id']))
        else:
            assetLocationInsertPayload.append((tagid, rackid, int(elem['uLoc']), timeStamp, timeStamp))
            assetPositionChangeInsertPayload.append(
                (tagid, rackid, int(elem['uLoc']), assetLocationResult[0]['location'], timeStamp, floor_id))
    else:
        # pass
        print("assetLocationResult is None so appending payload", tagid)
        assetLocationInsertPayload.append((tagid, rackid, int(elem['uLoc']), timeStamp, timeStamp))
        assetPositionChangeInsertPayload.append(
            (tagid, rackid, int(elem['uLoc']), 100, timeStamp, floor_id))


def assetTrackingDataFrame(assettrackingResult, assetEnergy, elem, assetTrackingInsertPaylod, asset, rackid,
                           timeStamp, floor_id):
    """ This function tracks the asset details  if its found the same data with in last two minutes then it will
    update or any of data changed in the sence it will append a one record to list """

    if assettrackingResult:
        tempf, humidityf, tempb, humidityb, power, energy, current, voltage, lastseen, tagid, location = (
            assettrackingResult[0]['tempf'], assettrackingResult[0]['humidityf'], assettrackingResult[0]['tempb'],
            assettrackingResult[0]['humidityb'],
            assettrackingResult[0]['power'], assettrackingResult[0]['energy'], assettrackingResult[0]['current'],
            assettrackingResult[0]['voltage'], assettrackingResult[0]['lastseen'],
            assettrackingResult[0]['id'], assettrackingResult[0]['location'])

        if energy != assetEnergy or tempf != float(elem['t_f']) or tempb != float(
                elem['t_b']) or humidityf != float(elem['rh_f']) or humidityb != float(
            elem['rh_b'] or location != elem['uLoc']):

            assetTrackingInsertPaylod.append((asset['id'], timeStamp,
                                              elem['t_f'], elem['t_b'],
                                              float(elem['rh_f']), float(elem['rh_b']),
                                              float(elem['Ia']), float(elem['V']), elem['pf'],
                                              assetEnergy,
                                              float(elem['bat']), rackid, elem['uLoc'], floor_id))

        elif timeStamp >= lastseen + datetime.timedelta(minutes=2):
            assetTrackingInsertPaylod.append((asset['id'], timeStamp,
                                              float(elem['t_f']), float(elem['t_b']),
                                              float(elem['rh_f']), float(elem['rh_b']),
                                              float(elem['Ia']), float(elem['V']), float(elem["pf"]),
                                              assetEnergy,
                                              float(elem['bat']), rackid, int(elem['uLoc']), floor_id))
        else:
            pass
    else:
        assetTrackingInsertPaylod.append((asset['id'], timeStamp,
                                          float(elem['t_f']), float(elem['t_b']),
                                          float(elem['rh_f']), float(elem['rh_b']),
                                          float(elem['Ia']), float(elem['V']), float(elem["pf"]), assetEnergy,
                                          float(elem['bat']), rackid, int(elem['uLoc']), floor_id))


def loopAsets(timeStamp, assets, rackResult, assetResult, slaveUpdatePayload, racksUpdatePayload, rackCount,
              hotSpotEnergyEventPayload, hotSpotEnergyEventUpdatePayload, alertInsertPayload, alertUpadtePayload,
              assetLocationInsertPayload, assetLocationUpdatePayload, assetPositionChangeInsertPayload,
              assetUpdatePayload, assetTrackingInsertPaylod, floor_id, cursor, db):
    for elem in assets:
        if elem["sg"] not in slaveUpdatePayload:
            slaveUpdatePayload.append(elem["sg"])
        rack = findRack(elem, rackResult)
        print(rack['macid'], elem['rack'])
        hotspot = 0
        coldSpot = 0
        highPower = 0
        # print("rack found -----------------")
        # print(rack)
        if rack:
            rackid, macid, tempLow, tempHigh, humiLow, humiHigh, energy = (
                rack['id'], rack['macid'], rack['tempLow'], rack['tempHigh'], rack['humiLow'], rack['humiHigh'],
                rack['energy'])

            if rack['macid'] not in racksUpdatePayload:
                racksUpdatePayload.append(rack['macid'])

            asset = findAsset(elem, assetResult)
            if asset:
                if int(elem['uLoc']) != 100:
                    rackCount.append(rack['id'])

                assetEnergy = float(elem['V']) * float(elem['Ia']) * float(elem['pf'])
                tagid = asset['id']
                tempMax = asset['tempMax']
                tempMin = asset['tempMin']
                energyMax = asset['energyMax']
                ghostCount = asset['ghostCount']

                val = (tagid, rack['id'])
                #
                assetLocationResult = queryData(assetLocationTrackingSelectQuery, (tagid,), select, cursor, db)

                print("assetLocationResult is ---------------")
                print(assetLocationResult)
                #
                assetLocationTrackFunc(assetLocationResult, rackid, tagid, timeStamp, elem,
                                       assetLocationInsertPayload, assetLocationUpdatePayload,
                                       assetPositionChangeInsertPayload, floor_id)

                print("after assetLocationTrackFunc")
                #
                # """------------------------------------hotcoldspotEnergy -----------------------------------------------"""
                if float(elem['t_f']) > tempMax:
                    print("inside temp max")
                    hotspotValue = 1
                    hotspot = float(elem['t_f'])
                    hotcoldspotEnergy(selectQueryHotSpotEnergyEvent, val, select, cursor, db,
                                      hotSpotEnergyEventPayload, float(elem['t_f']), timeStamp, hotspotValue,
                                      hotSpotEnergyEventUpdatePayload)

                elif float(elem['t_f']) < tempMin:
                    print("inside temp min")
                    coldSpotValue = 2
                    coldSpot = float(elem['t_f'])
                    hotcoldspotEnergy(selectQueryColdSpotEnergyEvent, val, select, cursor, db,
                                      hotSpotEnergyEventPayload, float(elem['t_f']), timeStamp, coldSpotValue,
                                      hotSpotEnergyEventUpdatePayload)
                else:
                    pass
                #
                if assetEnergy > energyMax:
                    print("inside energy min")
                    highpowereventValue = 3
                    highPower = assetEnergy
                    ghostCount = ghostCount - ghostCount

                    hotcoldspotEnergy(selectQueryEnergyEvent, val, select, cursor, db, hotSpotEnergyEventPayload,
                                      assetEnergy, timeStamp, highpowereventValue, hotSpotEnergyEventUpdatePayload)
                else:
                    ghostCount = ghostCount + 1
                #
                # """-----------------------------------------------------------------------------------"""
                #
                # """------------------------------inserting freefall alert ----------------------------"""
                # if int(elem["alert"]) == 3:
                #     alertInsertPayload.append(
                #         (elem["alert"], timeStamp, tagid, 0, 0, 0, rack['id'], timeStamp))
                # """---------------------------------------------------------------------------------"""

                """----------------------tempHumiEnergyAlertInsert by comparing rack------------------------"""
                if float(elem["t_f"]) > tempHigh or float(elem['t_f']) < tempLow:
                    tempAlertResult = queryData(selectTempAlertQuery, val, select, cursor, db)
                    if tempAlertResult:
                        tempHumiEnergyAlertInsert(tagid, rackid, float(elem["t_f"]), timeStamp, "temp",
                                                  alertInsertPayload,
                                                  tempAlertResult[0], alertUpadtePayload, floor_id)
                    else:
                        alertInsertPayload.append(
                            (8, timeStamp, tagid, 0, float(elem["t_f"]), 0, rackid, timeStamp, floor_id))

                if float(elem["rh_f"]) > humiHigh or float(elem['rh_f']) < humiLow:
                    humiAlertResult = queryData(selectHumiAlertQuery, val, select, cursor, db)
                    if humiAlertResult:
                        tempHumiEnergyAlertInsert(tagid, rackid, float(elem["rh_f"]), timeStamp, "humi",
                                                  alertInsertPayload,
                                                  humiAlertResult[0], alertUpadtePayload, floor_id)
                    else:
                        alertInsertPayload.append(
                            (9, timeStamp, tagid, float(elem["rh_f"]), 0, 0, rackid, timeStamp, floor_id))

                if assetEnergy >= energy:
                    energyAlertResult = queryData(selectEnergyAlertQuery, val, select, cursor, db)

                    if energyAlertResult:
                        tempHumiEnergyAlertInsert(tagid, rackid, assetEnergy, timeStamp, "energy",
                                                  alertInsertPayload,
                                                  energyAlertResult[0], alertUpadtePayload, floor_id)
                    else:
                        alertInsertPayload.append(
                            (10, timeStamp, tagid, 0, 0, assetEnergy, rackid, timeStamp, floor_id))

                """---------------------------------------------------------------------------------------------"""

                if rackid != asset['placedIn_id']:
                    assetUpdatePayload.append((timeStamp, elem['bat'], elem['t_f'], elem['rh_f'],
                                               elem['t_b'], elem['rh_b'], elem['pf'], elem['V'],
                                               elem['uLoc'], elem['Ia'], asset['placedIn_id'], rackid,
                                               assetEnergy, hotspot, coldSpot, highPower,
                                               ghostCount,
                                               timeStamp, elem['id']))
                else:
                    assetUpdatePayload.append((timeStamp, elem['bat'], elem['t_f'], elem['rh_f'],
                                               elem['t_b'], elem['rh_b'], elem['pf'], elem['V'],
                                               elem['uLoc'], elem['Ia'], asset['removedFrom_id'], rackid,
                                               assetEnergy, hotspot, coldSpot, highPower,
                                               ghostCount,
                                               timeStamp, elem['id']))

                """---------------------------------------------------------------------------------------"""
                assetTuple = (tagid,)
                assettrackingResult = queryData(assettrackingSelectQuery, assetTuple, select, cursor, db)
                # print("-------------------------assettrackingResult")
                print(assettrackingResult)

                assetTrackingDataFrame(assettrackingResult, assetEnergy, elem, assetTrackingInsertPaylod,
                                       asset, rackid, timeStamp, floor_id)


# @profile
def storeData(jsonList, topic):
    try:
        cursor = db.cursor(dictionary=True)
        timeStamp = datetime.datetime.now()
        slaveUpdatePayload = []
        racksUpdatePayload = []
        rackCount = []
        assetCountInsertPayload = []
        hotSpotEnergyEventPayload = []
        hotSpotEnergyEventUpdatePayload = []
        alertInsertPayload = []
        tempHumiEnergyAlertInsert = []
        alertUpadtePayload = []
        assetLocationInsertPayload = []
        assetLocationUpdatePayload = []
        assetPositionChangeInsertPayload = []
        assetTrackingInsertPaylod = []
        assetUpdatePayload = []

        masterMacid = jsonList["master"]

        # print("master tuple is -------", masterTuple)

        masterResult = queryData(masterSelectQuery, (masterMacid,), select, cursor, db)
        print("master result is ---------------")
        print(masterResult)
        if masterResult:
            masterTuple = (timeStamp, masterMacid)
            floorid = masterResult[0]['floor_id']
            print("floor id ", floorid, type(floorid))
            queryData(masterUpdateQuery, masterTuple, update, cursor, db)
            print("master is updated------")

            if len(jsonList['assets']):
                rackResult = queryData(rackSelectQuery, (floorid,), select, cursor, db)

                assetResult = queryData(assetSelectQuery, (floorid,), select, cursor, db)

                if len(rackResult):
                    loopAsets(timeStamp, jsonList['assets'], rackResult, assetResult, slaveUpdatePayload,
                              racksUpdatePayload, rackCount, hotSpotEnergyEventPayload, hotSpotEnergyEventUpdatePayload,
                              alertInsertPayload, alertUpadtePayload, assetLocationInsertPayload,
                              assetLocationUpdatePayload, assetPositionChangeInsertPayload, assetUpdatePayload,
                              assetTrackingInsertPaylod, floorid, cursor, db)

            print("after looping assets")
            print("----------------------------")
            # print(rackCount)

            if len(rackCount):
                a = dict(Counter(rackCount))
                for keys, value in a.items():
                    # print(keys, value)
                    assetCountInsertPayload.append((keys, value, timeStamp))

            # print("slave update payload length tempMaxSelectQuery is ", len(slaveUpdatePayload))
            if len(slaveUpdatePayload):
                payload = addTimestamp(slaveUpdatePayload, timeStamp)
                # queryData(rackUpdateQuery, payload, cursor, db)
                print("length of slave", len(slaveUpdatePayload), len(payload))
                queryData(slaveUpdateQuery, payload, cursor, db)
                print("slave data is updated")
                logger.info("slave data is updated")

            if len(racksUpdatePayload):
                payload = addTimestamp(racksUpdatePayload, timeStamp)
                queryData(rackUpdateQuery, payload, cursor, db)
                print("length of the rack payload", len(payload))
                print("rack bulk data is updated")
                logger.info("rack bulk data is updated")

            print("assetUpdatePayload length is ", len(assetUpdatePayload))
            if len(assetUpdatePayload):
                queryData(updateAssetQuery, assetUpdatePayload, cursor, db)
                print("assetUpdatePayload length is inserted")
                logger.info("assetUpdatePayload length is inserted")

            print("assetCountInsertPayload length is ", len(assetCountInsertPayload))
            if len(assetCountInsertPayload):
                queryData(insertAssetCountQuery, assetCountInsertPayload, cursor, db)
                print("length of the assetCountInsertPayload", len(assetCountInsertPayload))
                print("assetCountInsertPayload data is inserted")
                logger.info("rack bulk data is updated")

            print("length of the hotSpotEnergyEventPayload  insert ", len(hotSpotEnergyEventPayload))
            if len(hotSpotEnergyEventPayload):
                queryData(insertHotSpotEnergyEvent, hotSpotEnergyEventPayload, cursor, db)
                print("hotSpotEnergyEventPayload is inserted")
                logger.info("hotSpotEnergyEventPayload is inserted")

            print("length of the hotSpotEnergyEventUpdatePayload ", len(hotSpotEnergyEventUpdatePayload))
            if len(hotSpotEnergyEventUpdatePayload):
                queryData(updateHotSpotEnergyEvent, hotSpotEnergyEventUpdatePayload, cursor, db)
                print("hotSpotEnergyEventUpdatePayload is updated")
                logger.info("hotSpotEnergyEventUpdatePayload is inserted")

            print("length of the assetLocationInsertPayload ", len(assetLocationInsertPayload))
            if len(assetLocationInsertPayload):
                queryData(assetLocationTrackingInsertQuery, assetLocationInsertPayload, cursor, db)
                print("hotSpotEnergyEventPayload is inserted")
                logger.info("hotSpotEnergyEventPayload is inserted")

            print("length of the assetLocationUpdatePayload ", len(assetLocationUpdatePayload))
            if len(assetLocationUpdatePayload):
                queryData(assetLocationTrackingUpdateQuery, assetLocationUpdatePayload, cursor, db)
                print("assetLocationUpdatePayload is updated")
                logger.info("assetLocationUpdatePayload is updated")

            print("length of the assetPositionChangeInsertPayload ", len(assetPositionChangeInsertPayload))
            if len(assetPositionChangeInsertPayload):
                queryData(insertpositionAlertofAsset, assetPositionChangeInsertPayload, cursor, db)
                print("assetLocationUpdatePayload is updated")
                logger.info("assetLocationUpdatePayload is updated")

            print("length of alertInsertPayload ", len(alertInsertPayload))
            if len(alertInsertPayload):
                queryData(alertInsert, alertInsertPayload, cursor, db)
                print("alertInsert data is inserted ---")
                logger.info("alertInsert data is inserted ---")

            print("alertUpadtePayload length is ", len(alertUpadtePayload))
            if len(alertUpadtePayload):
                queryData(updateAlertQuery, alertUpadtePayload, cursor, db)
                print("alertUpadtePayload length is inserted")
                logger.info("alertUpadtePayload length is inserted")

            print("assetttracking payload length is ", len(assetTrackingInsertPaylod))
            if len(assetTrackingInsertPaylod):
                queryData(insertAssetTrckingQuery, assetTrackingInsertPaylod, cursor, db)
                print("assettracking payload inserted ")
                logger.info("assettracking payload inserted ")

        cursor.close()

    except Exception as err:
        logger.info("ERROR OCCURRED - " + str(err))
        print("error-------------------------------------------------", err)


def on_connect(client, userdata, flags, rc):
    """ on connection of MQTT Broker it subscribe the given topic"""
    logger.info("Connected to broker")
    print("connected to broker ----------------")
    client.subscribe(topic)  # subscribe topic test


def on_disconnect(client, userdata, rc):
    """ If on disconnection of MQTT broker This function will invoke and try to connect to the broker again """
    if rc != 0:
        logger.info("Disconnection from broker, Reconnecting...")
        print("disconnection")
        systemcon()
        client.subscribe(topic)  # subscribe topic test


def systemcon():
    """ This function connects MQTT Broker"""
    st = 0
    try:
        st = client.connect(BROKER_ENDPOINT, PORT)  # establishing connection
    except:
        st = 1
    finally:
        if st != 0:
            logger.info("Connection failed, Reconnecting...")
            print("connection failed")
            time.sleep(5)
            systemcon()


if __name__ == "__main__":
    with open('/home/sanjeeva/Vacus/YoktaUpdatingChanges/logs/tracking.yaml', 'r') as stream:
        logger_config = yaml.load(stream, yaml.FullLoader)
    config.dictConfig(logger_config)
    logger = getLogger('Tracking')
    client = paho.Client()  # create client object
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    systemcon()
    client.subscribe(topic)  # subscribe topic test
    client.loop_forever()

