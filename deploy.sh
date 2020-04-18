#!/bin/bash
tar -cpzf ser.tar.gz --exclude=./server/db/data ./server
scp ./ser.tar.gz lemon@182.92.86.236:/home/lemon/Workspace/Nodejs
rm ./ser.tar.gz
ssh -p 22 lemon@182.92.86.236
cd /home/lemon/Workspace/Nodejs
rm -rf ./server
tar -xpzf ser.tar.gz -C .
rm ./ser.tar.gz
tmux kill-server
tmux
node server/app.js