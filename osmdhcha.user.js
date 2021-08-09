// ==UserScript==
// @name        Additional Links for the openstreetmap.org-sidebar
// @description This script adds links to OSM Deep History for Nodes, Ways and Relations, OSMCha for Changesets as well as KartaView and Mapillary in the primary navigation when displayed on openstreetmap.org.
// @version     10
// @grant       none
// @copyright   2021, https://github.com/joshinils and https://github.com/kmpoppe
// @license     MIT
// @icon        https://www.openstreetmap.org/assets/favicon-16x16-474476c1b2381628a81361a9e2bf04b936d21f77c59e84b48c6c69ea376fb6cf.png
// @match https://www.openstreetmap.org/*
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
  sidebar_content = document.getElementById("sidebar_content").getElementsByClassName("browse-section")[0];
  navbar_content = document.getElementsByClassName("primary")[0].getElementsByClassName("btn-group")[0];

  // parse the current URI into RegEx matches
  loc = window.location.toString();
  objectMatches = loc.match(/(changeset|node|way|relation)\/(\d+)/);
  if (objectMatches) {
    OsmObject = {
      id: objectMatches[2],
      type: objectMatches[1]
    };
  }
  mapMatches = loc.match(/#map=(\d+)\/([\d|.]*)\/([\d|.]*)/);
  if (mapMatches) {
    iZoom = parseInt(mapMatches[1]) - 1;
    OsmMap = {
      lat: mapMatches[2],
      lon: mapMatches[3],
      zoom: iZoom.toString()
    };
  }

  // Add links to the sidebar (node, way, relation, changeset)
  if (sidebar_content) {
    displayContainer = document.createElement("div");
    displayContainer.id = "GM-CONTA";
    displayContainer.className = "browse-tag-list";

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
      sidebar_content.parentNode.insertBefore(displayContainer, sidebar_content);
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
