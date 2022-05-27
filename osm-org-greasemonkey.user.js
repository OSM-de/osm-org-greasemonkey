// ==UserScript==
// @name        Additional Links for the openstreetmap.org-sidebar
// @description This script adds links to OSM Deep History for Nodes, Ways and Relations, OSMCha for Changesets as well as KartaView and Mapillary in the primary navigation when displayed on openstreetmap.org.
// @version     13
// @grant       none
// @copyright   2021-2022, https://github.com/joshinils and https://github.com/kmpoppe
// @license     MIT
// @updateURL   https://cdn.jsdelivr.net/gh/OSM-de/osm-org-greasemonkey@master/osm-org-greasemonkey.user.js
// @installURL  https://cdn.jsdelivr.net/gh/OSM-de/osm-org-greasemonkey@master/osm-org-greasemonkey.user.js
// @downloadURL https://cdn.jsdelivr.net/gh/OSM-de/osm-org-greasemonkey@master/osm-org-greasemonkey.user.js
// @icon        https://www.openstreetmap.org/assets/favicon-16x16-474476c1b2381628a81361a9e2bf04b936d21f77c59e84b48c6c69ea376fb6cf.png
// @match       https://www.openstreetmap.org/*
// ==/UserScript==

// Mutation observer for URI (Source: https://stackoverflow.com/a/46428962)
var oldHref = document.location.href;
window.onload = function() {
  var config = {
    childList: true,
    subtree: true
  };
  var bodyList = document.querySelector("body");
  var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (oldHref !== document.location.href) {
          oldHref = document.location.href;
          modifyContent();
        }
      });
    });
  observer.observe(bodyList, config);
};

modifyContent();

function modifyContent() {
  // new DOM objects
  var displayContainer;
  // native DOM objects
  var sidebar_content;
  var navbar_content;
  // other variables
  var thisUrl;
  var loc;
  var objectMatches;
  var mapMatches;
  var iZoom;
  var OsmObject = { id: "", type: "" };
  var OsmMap = { lat: "", lon: "", zoom : "" };

  // get native DOM objects
  sidebar_content = document.getElementById("sidebar_content");
  navbar_content = document.getElementsByClassName("primary")[0].getElementsByClassName("btn-group")[0];

  // parse the current URI into RegEx matches
  loc = window.location.toString();
  objectMatches = loc.match(/(changeset|node|way|relation|note)\/(\d+)/);
  if (objectMatches) {
    OsmObject = {
      id: objectMatches[2],
      type: objectMatches[1]
    };
  }
  mapMatches = loc.match(/#map=(\d+)\/([\-|\d|.]*)\/([\-|\d|.]*)/);
  if (mapMatches) {
    iZoom = parseInt(mapMatches[1]) - 1;
    OsmMap = {
      lat: mapMatches[2],
      lon: mapMatches[3],
      zoom: iZoom.toString()
    };
  }

  // Add links to the sidebar (node, way, relation, changeset, note)
  if (sidebar_content) {
    displayContainer = document.createElement("div");
    displayContainer.id = "GM-CONTA";
    displayContainer.className = "browse-tag-list";

		// Notes ONLY
    if (OsmObject.type === "note") {
      // Overpass History
      note_details = document.getElementById("sidebar_content").getElementsByTagName('div')[3].getElementsByClassName("details")[0];
      note_location = note_details.getAttribute("data-coordinates");
      const note_time = new Date(Date.parse(note_details.querySelector("abbr").getAttribute("title"))).toISOString();
      thisUrl = "http://overpass-turbo.eu/?Q=%5Bdiff%3A%22" + note_time + "%22%5D%3B%28nw%28around%3A~~radius~~%2C" + note_location + "%29%3B%29%3Bout+body%3B%3E%3Bout+skel+qt%3B&R";
      createOrUpdateOverpassHistory("GM-OVERP", displayContainer, thisUrl, "Overpass History");
    }
    // Changesets ONLY
    if (OsmObject.type === "changeset") {
      thisUrl = "https://osmcha.org/changesets/" + OsmObject.id;
      createOrUpdate("GM-OMSCH", displayContainer, thisUrl, "OSMCha for this Changeset");
    }
    // Nodes, Ways, Relations ONLY
    if (new RegExp(["node","way","relation"].join("|")).test(OsmObject.type)) {
      // OSM Deep History
      thisUrl = "https://osmlab.github.io/osm-deep-history/#/" + OsmObject.type + "/" + OsmObject.id;
      createOrUpdate("GM-OMSDH", displayContainer, thisUrl, "OSM Deep History");
      thisUrl = "https://nominatim.openstreetmap.org/ui/details.html?osmtype=" + OsmObject.type.substring(0, 1).toUpperCase() + "&osmid=" + OsmObject.id;
      // Nominatim Details
      createOrUpdate("GM-NOMIN", displayContainer, thisUrl, "Nominatim Details");
    }
    if (!document.getElementById("GM-CONTA")) {
      sidebar_content.getElementsByTagName('div')[3].parentNode.insertBefore(displayContainer, sidebar_content.getElementsByTagName('div')[3]);
    }
  }

  // Add links to the primary navigation bar
  if (navbar_content) {
    if (loc.includes("#map=")) {
      // Mapillary
      thisUrl = "https://www.mapillary.com/app/?lat=" + OsmMap.lat + "&lng=" + OsmMap.lon + "&z=" + OsmMap.zoom;
      createOrUpdate("GM-MAPIL", navbar_content, thisUrl, "Mapillary", "btn btn-outline-primary");
      // KartaView
      thisUrl = "https://kartaview.org/map/@" + OsmMap.lat + "," + OsmMap.lon + "," + OsmMap.zoom + "z";
      createOrUpdate("GM-KARTA", navbar_content, thisUrl, "KartaView", "btn btn-outline-primary");
    }
  }
}

// Create, Update and DOM Elements general
function createOrUpdate(id, targetObject, thisUrl, text, className = "") {
  var existingAnchor = document.getElementById(id);
  if (existingAnchor) {
    existingAnchor.href = thisUrl;
  } else {
    targetObject.appendChild(
      getAnchorElement(
        id,
        thisUrl,
        text,
        className
      )
    );
  }
}

function getAnchorElement(id, url, text, className = "", target = "_blank") {
  var anchor;
  anchor = document.createElement("a");
  anchor.id = id;
  anchor.target = target;
  anchor.href = url;
  anchor.innerHTML = "<center>" + text + "</center>";
  if (className !== "") {
    anchor.className = className;
  }
  return anchor;
}

// Create, Update and DOM Elements for Overpass History
function createOrUpdateOverpassHistory(id, targetObject, thisUrl, text, className = "") {
  var existingAnchor = document.getElementById(id);
  if (existingAnchor) {
    existingAnchor.href = thisUrl;
  } else {
    targetObject.appendChild(
      getAnchorElementOverpassHistory(
        id,
        thisUrl,
        text,
        className
      )
    );
  }
}

function getAnchorElementOverpassHistory(id, url, text, className = "", target = "_blank") {
  var anchor;
  anchor = document.createElement("a");
  anchor.id = id;
  anchor.target = target;
  anchor.innerHTML = "<center>" + text + "</center>";
  anchor.href = "#";
  if (className !== "") {
    anchor.className = className;
  }
  anchor.addEventListener('click', function handleClick(event) {
    var radius = prompt("Radius (metres) for history to be checked (default = 10, shouldn't be more than 100 due to performance)?", "10");
    iRadius = parseInt(radius, 10);
    if (Number.isNaN(Number(iRadius)) || iRadius < 10) { iRadius = 10; }
    url = url.replace("~~radius~~", iRadius);
    if (radius !== null) { window.open(url, '_blank'); }
  });
  return anchor;
}
