# Additional links for openstreetmap.org using [Greasemonkey]([https://wikipedia.org/wiki/Greasemonkey](https://www.greasespot.net/))

This script adds links to OSM Deep History for Nodes, Ways and Relations, OSMCha for Changesets as well as KartaView and Mapillary buttons 
in the primary navigation when displayed on openstreetmap.org.

Idea and initial version by [joshinils](https://github.com/joshinils), updates and transfer to OSM-de-organisation by [Kai](https://github.com/kmpoppe).

# Installation into Greasemonkey

Once you have the Greasemonkey AddOn in your browser, simply use [this](https://cdn.jsdelivr.net/gh/OSM-de/osm-org-greasemonkey@master/osm-org-greasemonkey.user.js) link to download the latest version of the script - the AddOn will automatically show you an install screen.

![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hm/OSM-de/osm-org-greasemonkey?style=for-the-badge)

# What this script provides

## Primary Navigation Header

* Links to Mapillary, Kartaview and BingMaps Aerial Layer at the map location and zoom level.
* Links to OSM Community and OSM Wiki

![grafik](https://github.com/OSM-de/osm-org-greasemonkey/assets/24451207/57c3bf80-8e5c-41a4-8731-dd01b0517b71)

## Sidebar Navigation

### When viewing a Changeset

* Link to OSMCha for that Changeset

![grafik](https://github.com/OSM-de/osm-org-greasemonkey/assets/24451207/13c0de19-e47f-4d57-8d39-c116f9029aa4)

### When viewing a Note

* Link to Overpass History between the note creation date and today for a radius

![grafik](https://github.com/OSM-de/osm-org-greasemonkey/assets/24451207/2ea8469c-3f92-4b25-997b-408beb0845f9)

### When viewing any object (Node, Way, Relation)

* Links to OSM Deep History and Nominatim

![grafik](https://github.com/OSM-de/osm-org-greasemonkey/assets/24451207/60ab1cb1-1098-4b6d-b737-79db781818ef)

* Linkifies values that point to external websites that aren't provided by osm-website for these tags:
  * `HE_ref` and `ref:GB:nhle` (Historic England)
  * `ref:hmdb` (Historical Markers Database)
  * `ref:GB:hs` (Historic Environment Scotland)
  * `openplaques:id` (OpenPlaques)
  * `mapillary` (Mapillary)

![grafik](https://github.com/OSM-de/osm-org-greasemonkey/assets/24451207/3d01725d-cfaa-43f7-a2d3-7327b2fbee30)

## "My Notes" page on your profile

* Button to reduce the list to only show unresolved Notes
