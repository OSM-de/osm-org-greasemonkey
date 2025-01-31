# Additional links for openstreetmap.org using Greasemonkey or Tampermonkey

This script adds a lot of functionality to openstreetmap.org:

* Link to OSM Deep History and Nominatim for Nodes, Ways and Relations
* Link to OSMCha for Changesets
* Link to Overpass for seeing the history around a Note
* Aerial/Streetside imagery from KartaView, Mapillary, mapilio and Bing 

Idea and initial version by [joshinils](https://github.com/joshinils), updates and transfer to OSM-de-organisation by [Kai](https://github.com/kmpoppe).

# Installation

Once you have the Greasemonkey (https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or Tampermonkey (https://www.tampermonkey.net/), simply use [this](https://cdn.jsdelivr.net/gh/OSM-de/osm-org-greasemonkey@master/osm-org-greasemonkey.user.js) link to download the latest version of the script - the AddOn will automatically show you an install screen.

![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hm/OSM-de/osm-org-greasemonkey?style=for-the-badge)

# What this script provides

## Primary Navigation Header

* Links to Mapillary, Kartaview, mapilio and BingMaps Aerial Layer at the map location and zoom level.
* Links to OSM Community and OSM Wiki

![grafik](https://github.com/user-attachments/assets/3465af42-de0d-46a8-b581-16cb3d2c6cee)

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
  * `ref:doc` (Department of Conservation New Zealand)
  * `HE_ref` and `ref:GB:nhle` (Historic England)
  * `ref:hmdb` (Historical Markers Database)
  * `ref:GB:hs` (Historic Environment Scotland)
  * `ref:ie:niah` (National Index of Architectural Heritage Ireland)
  * `ref:ISIL` (ISIL for BE, DE, IT, NO)
  * `openplaques:id` (OpenPlaques)
  * `mapillary` (Mapillary)
  * `fhrs:id` (FHRS)
  * `sketchfab` (sketchfab.com)
  * `ref:whc` (UNESCO World Heritage Sites)

![grafik](https://github.com/OSM-de/osm-org-greasemonkey/assets/24451207/3d01725d-cfaa-43f7-a2d3-7327b2fbee30)

## "My Notes" page on your profile

* Button to reduce the list to only show unresolved Notes
