#!/bin/bash
tar -cpzf ser.tar.gz --exclude=./server/db/data ./server
scp ./ser.tar.gz lemon@182.92.86.236:/home/lemon/Workspace/Nodejs
rm ./ser.tar.gz
ssh -p 22 lemon@182.92.86.236 "cd /home/lemon/Workspace/Nodejs; tar -xpzf ser.tar.gz -C .; rm ./ser.tar.gz; pkill node; nohup node server/app.js >/dev/null 2>&1 &"