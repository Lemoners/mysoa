#!/bin/bash
cd ./server/db/data/DXY-COVID-19-Data
git pull
cd ..
python pre_process.py
python hp_data_save.py
cd /home/lemon/Workspace/2020Semester/SOA/mysoa
tar -cpzf ser.tar.gz ./server ./package-lock.json ./package.json
scp ./ser.tar.gz lemon@182.92.86.236:/home/lemon/Workspace/Nodejs
rm ./ser.tar.gz
ssh -p 22 lemon@182.92.86.236 "cd /home/lemon/Workspace/Nodejs; tar -xpzf ser.tar.gz -C .; rm ./ser.tar.gz; node ./server/db/init-db.js; npm install; pkill node; nohup node server/app.js >/dev/null 2>&1 &"