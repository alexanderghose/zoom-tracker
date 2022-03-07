# OVERVIEW

1. When the zoom classroom is closed, zoom processes the video, then sends the host an email with a certain subject line, containing the recording link and password.
2. IF the script is running when the zoom email comes in (and if the email's subject and from address matches the config), the script parses the email, and saves the URL and password into the provided google sheet. 
3. If the script is not running when the email comes in, nothing happens!


# HOW TO RUN SCRIPT ON THE COMMAND LINE

node zoom-recording-upload-bot.js


# HOW TO RUN SCRIPT AS A SERVICE / DAEMON (ie., run it once and forget about it):

1. PM2 on a linux machine - When I had this running previously, I had put it on a linux server and I had basically just done "pm2 start index.js" to start it, and it ran forever. pm2 help had a list of nice features as well like logs. Not sure if pm2 runs on windows, never tried.
2. https://github.com/coreybutler/node-windows (used this once a few years ago)


# HOW TO CONFIGURE SCRIPT (email address, etc.):

PART 1 - config/ folder has 3 cnfig files:

1 - zoom-recording-tracker.json is the "google service account" credentials, which was created by Doug. This can be left alone (which I do) or replaced by your own "service account".
2 - topic.json - this is what will appear on the google sheets "topic" column since this information cannot be extracted from the email. I find "today's lectures" to be a good vague topic covering today's work
3 - conf.json - the main config file. Most of them might be self-explanatory but:
	-the zoom "from" email i've always left as is
	-the subject should be updated to match. Before the cohort starts i'll go in and create the room, record a sec, then shut down the room a few times until i see the recordings show up on the sheet.
	-the gmail password can be the actual gmail password or you can create an "app password" which might require you to enable 2FA on your gmail account -- steps are go to myaccount.google.com, click "security" in the left sidebar, then enable 2-step verification, then click "app passwords" and generate one. i usually go the "app password" route
	-the host and port i've never touched
	-the sheet id is from the google sheets URL
	-the urlCol specifies which column the url should be written into
	-the dateCol specifies which column the date should be written into
	-the passCol specifies which the password should be written into
	-headerRow specifies, i think, the first row the program will write to

Part 2 - GOOGLE SHEET CONFIG

In the actual google sheet, click the "share" button and add "zoom-recording-tracker-bot@zoom-recording-tracker.iam.gserviceaccount.com" and give the bot write/editor access.


# OTHER NOTES

One of the node_modules had to be fixed manually by changing the source, hence the zip file instead of just a package.json with the modules
