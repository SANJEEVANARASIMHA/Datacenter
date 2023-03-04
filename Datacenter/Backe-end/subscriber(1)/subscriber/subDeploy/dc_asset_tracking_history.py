#! /usr/bin/python3
# This script subscribes to the broker(cloud) and stores the receiver data in the web server's database
import mysql.connector
import logging
import logging.handlers
import json
import datetime
import time

DB_USERNAME = "sagar"
DB_PASSWORD = "sagar@123"
DB_NAME = "yokta2"


def storeData():
    try:
        db = mysql.connector.connect(
            host="192.168.1.107",
            user=DB_USERNAME,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = db.cursor()
        currentDate1 = datetime.date.today()
        currentDate = currentDate1 - datetime.timedelta(days=1)
        # sql = "select tagid_id,round(avg(p.tempf)) as tempf, round(avg(p.humidityf)) as humidityf, p.time from" \
        #             " (select tagid_id,tempf,humidityf,date_format(lastseen-interval minute(lastseen)%30 minute, '%Y-%m-%d %H:%i') as time " \
        #             "from asset_assettracking where lastseen like '" + str(currentDate) + "%'" \
        #             "group by date_format(lastseen-interval minute(lastseen)%30 minute, '%Y-%m-%d %H:%i'), tempf, humidityf,tagid_id) as p  group by p.time, tagid_id;"
        sql = "select tagid_id, round(avg(tempf),2), round(avg(humidityf),2), round(avg(tempb),2), round(avg(humidityb),2), round(avg(power),2), round(avg(energy),2), battery, round(avg(current),2), avg(voltage), location, floor_id, rack_id, date_format(lastseen-interval minute(lastseen)%30 minute, '%Y-%m-%d %H:%i') as time from asset_assettracking group by tagid_id, time;"
        cursor.execute(sql,)

        result = cursor.fetchall()
        print("Floor Data ----------", result)
        if result is not None:
            payload = []
            for row in result:
                tagid=row[0]
                tempf=row[1]
                humidityf=row[2]
                tempb=row[3]
                humidityb = row[4]
                power = row[5]
                energy = row[6]
                battery = row[7]
                current = row[8]
                voltage = row[9]
                location = row[10]
                floor = row[11]
                rack = row[12]
                lastseen = row[13]
                print(tagid, tempf,humidityf, tempb, humidityb, type(humidityb))
                payload.append((tempf,humidityf,tempb,humidityb,power,energy,lastseen,battery,current,voltage,location,floor,rack,tagid))
                # sql = "insert into  asset_assettrackinghistory (tempf, humidityf, tempb, humidityb, power, energy, lastseen, battery, current, voltage, location, floor_id, rack_id, tagid_id) values(" + str(
                #     tempf) + ","  + str(humidityf)+ ","  + str(tempb)+ ","  + str(humidityb)+ ","  + str(power)+ ","  + str(energy) + ",'" + str(lastseen) + "'," + str(battery)+ "," + str(current)+ "," + str(voltage)+ "," + str(location)+ "," + str(floor)+ "," + str(rack)+ "," + str(tagid) + ");"

            sql = """insert into  asset_assettrackinghistory (tempf, humidityf, tempb, humidityb, power, energy, lastseen, battery, current, voltage, location, floor_id, rack_id, tagid_id) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            cursor.executemany(sql, payload)
            db.commit()



    except Exception as err:
        print("----------------------", err)
        # logger.info("Failed to store data in database - " + str(err))

if __name__ == '__main__':
    # with open('/home/ubuntu/logs/logging_error.yaml', 'r') as stream:
    #     logger_config = yaml.load(stream, yaml.FullLoader)
    # logging.config.dictConfig(logger_config)
    logger = logging.getLogger('Temp/Humid -')
    storeData()
    # time.sleep(15)


# import socket
# s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# s.connect(("8.8.8.8", 80))
# print(s.getsockname()[0])
# s.close()