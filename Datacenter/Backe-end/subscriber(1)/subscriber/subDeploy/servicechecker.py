# import commands
# print(commands.getstatusoutput("systemctl status subscriber.service grep active "))
import os
import subprocess as sp
import time

import yaml
import logging
import logging.config as cfg


# output1 = sp.getoutput('systemctl status subscriber.service | grep inactive ')
# print(output1)
# print("length of the output", len(output1))

def testFunc():
    try:
        output1 = sp.getoutput(
            'journalctl -u subscriber.service --since "5min ago"   | grep "MySQL Connection not available"')
        print(output1)
        # logger.info("result is "+str(output1))
        print("output1", output1)

        output2 = sp.getoutput('journalctl -u subscriber.service --since "5min ago"   | grep "error"')
        print(output2)
        # logger.info("result is "+str(output2))
        print("output2", output2)

        if len(output2):
            print("mysql connection  error found !!")
            logger.info("mysql connection  error found !!")

            os.system("sudo systemctl restart subscriber.service")
            os.system("sudo systemctl restart cam_subscriber.service")
            logger.info("subscriber.service and cam_subscriber.service are restarted ")

        else:
            print("no mysql connection  error found !!")
            logger.info("no mysql connection  error found !!")
            logger.info("no services restarted")

        if len(output1):
            print("error found !!")
            logger.info("error found !!")
            os.system("sudo systemctl restart subscriber.service")
            os.system("sudo systemctl restart cam_subscriber.service")
            logger.info("subscriber.service and cam_subscriber.service are restarted ")
        else:
            print("no error found !! ")
            logger.info("no  error found !!")
            logger.info("no services restarted")

    except Exception as err:
        print("Error-----------", str(err))
        logger.info("Error-------" + str(err))


if __name__ == "__main__":
    with open('/home/ubuntu/logs/service.yaml', 'r') as stream:
        logger_config = yaml.load(stream, yaml.FullLoader)
        cfg.dictConfig(logger_config)
        logger = logging.getLogger('From trackingsub01.py file -Tracking')

    while True:
        time.sleep(5)
        testFunc()
        print("after 5 seconds ")
