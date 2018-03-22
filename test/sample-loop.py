import time
import sys

start = time.time()

i = 0
while True:
	now = time.time()
	lapsed = now - start
	if lapsed > 4:
		print "loop ended"
		sys.stdout.flush()
		break
	else:
		print "on going"
		sys.stdout.flush()
		i += 1
	time.sleep(1)
