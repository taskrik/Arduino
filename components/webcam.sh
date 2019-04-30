#gets the timestamp
DATE=$(date +"%Y-%m-%d_%H%M")

#takes a picture by running the script to the raspberry pi
fswebcam ../server/motionCaptures/capture-$DATE.jpg