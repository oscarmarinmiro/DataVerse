__author__ = '@oscarmarinmiro @ @outliers_es'

import pprint
import json
import csv

#first_level third_level second_level
# treemap	name	category	value	headline	text	media	media_credit	media_caption	link
# Service	root		0	Catalunya Square	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.	img/test2.jpg	Zach Wise/verite.co	Chicago to NYC
# Service	Jack Taylor & family	USA	12.8
# Service	Leonard Lauder	USA	7.5
# Service	Richard DeVos	USA	6.9
# Service	Micky Arison	USA	6.5
# Service	Liu Yongxing	CHN	5.5

FILE_IN = "david_bowie_data.videos.sincometas.json"

FILE_OUT = "treemap_data.csv"

my_data = json.load(open(FILE_IN, "rb"))

with open(FILE_OUT, 'wb') as csvfile:

    writer = csv.writer(csvfile)

    already_covered = {}

    for key, entry in my_data.items():
        print(key)

        album_name = entry['title']

        writer.writerow([album_name.encode("utf8"), "root", "", 0])

        for track in entry['tracks']:
            track_name = track['title']

            for cover in track['covers']:
                artist = cover['credits']

                hash = track_name + "#" + artist

                if not hash in already_covered and artist != "David Bowie":

                    pprint.pprint([album_name, track_name, artist])

                    already_covered[hash] = True

                    writer.writerow([album_name.encode("utf8"), artist.encode("utf8"), track_name.encode("utf8"), 1])
