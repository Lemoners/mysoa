import os

file_dir = os.path.dirname(os.path.abspath(__file__)) + "/log"

all_log_size = 0

for file in os.listdir(file_dir):
    with open(file_dir+"/"+file, 'r+') as f:
        log = f.read()
        log_size = len(log.strip().split("\n"))
        all_log_size += log_size

print("Average log per day is {}".format(all_log_size / len(os.listdir(file_dir))))


