masterSelectQuery = """SELECT * FROM gateway_mastergateway WHERE  gatewayid = %s """
masterUpdateQuery = """update gateway_mastergateway set lastseen=%s where gatewayid=%s"""
slaveUpdateQuery = """update gateway_slavegateway set lastseen=%s where gatewayid=%s """

rackSelectQuery = """SELECT * FROM rack_monitor_rack WHERE  floor_id = %s """
rackUpdateQuery = """update rack_monitor_rack set timestamp=%s where macid=%s"""

assetSelectQuery = """SELECT * FROM asset_asset WHERE floor_id= %s and deregisteredStatus=0 order by lastseen desc"""
updateAssetQuery = """ update asset_asset set lastseen=%s, battery=%s, tempf=%s, humidityf=%s, tempb=%s, humidityb=%s, power=%s, voltage=%s, location=%s, current=%s, removedFrom_id=%s, placedIn_id=%s,energy=%s, hotspot=%s, coldspot=%s,highpowerevent=%s,ghostCount=%s, ghostStart=%s where tagid=%s"""

insertAssetTrckingQuery = """INSERT INTO asset_assettracking(tagid_id,lastseen,tempf, tempb,humidityf, humidityb,current,voltage, power,energy,battery, rack_id, location, floor_id) VALUES(%s, %s, %s, %s, %s, %s, %s, %s,%s,%s,%s,%s,%s,%s)"""
alertInsert = """insert into alert_alert(value, lastseen,macid_id,humidity, temperature,energy, rack_id, endTime, floor_id) values(%s,%s,%s,%s,%s,%s,%s,%s, %s)"""
assettrackingSelectQuery = """SELECT * FROM asset_assettracking WHERE tagid_id =%s order by lastseen desc limit 1"""


selectTempAlertQuery = """select * from alert_alert where macid_id=%s and rack_id=%s and value=8 and temperature!=0 order by endtime desc limit 1"""
selectHumiAlertQuery = """select * from alert_alert where macid_id=%s and rack_id=%s and value=9 and humidity!=0 order by endtime desc limit 1"""
selectEnergyAlertQuery = """select * from alert_alert where macid_id=%s and rack_id=%s and value=10 and energy!=0 order by endtime desc limit 1"""
updateAlertQuery = """update alert_alert set endTime=%s where id=%s"""

insertQueryHotSpotEnergyEvent = """ insert into asset_hotspotenergyevent(tagid_id,rack_id,event,eventValue,timestamp, endTime) values(%s,%s,%s,%s,%s,%s)"""
selectQueryHotSpotEnergyEvent = """ select * from asset_hotspotenergyevent where tagid_id=%s and rack_id=%s and event=1 order by endTime desc limit 1"""
selectQueryColdSpotEnergyEvent = """ select * from asset_hotspotenergyevent where tagid_id=%s and rack_id=%s and event=2 order by endTime desc limit 1"""
selectQueryEnergyEvent = """ select * from asset_hotspotenergyevent where tagid_id=%s and rack_id=%s and event=3 order by endTime desc limit 1"""
insertHotSpotEnergyEvent = """insert into asset_hotspotenergyevent(tagid_id, rack_id, event,eventValue,timestamp, endTime) values(%s,%s,%s,%s,%s,%s)"""
updateHotSpotEnergyEvent = """update asset_hotspotenergyevent set endTime=%s where id=%s"""

assetLocationTrackingSelectQuery = """select * from asset_assetlocationtracking where tagid_id=%s order by id desc limit 1"""
assetLocationTrackingInsertQuery = """insert into asset_assetlocationtracking(tagid_id, rack_id, location,startTime,endTime) values(%s,%s,%s,%s,%s)"""
assetLocationTrackingUpdateQuery = """ update asset_assetlocationtracking set endtime=%s where id=%s"""


insertAssetCountQuery = """ insert into rack_monitor_rackwiseassetcount(rack_id, count, time) values(%s, %s, %s)"""
insertpositionAlertofAsset = """insert into alert_assetlocationchange(macid_id,rack_id, placedIN, removedFrom, timestamp, floor_id) values(%s,%s,%s,%s,%s, %s)"""