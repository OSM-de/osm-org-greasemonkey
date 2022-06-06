// ==UserScript==
// @name        Additional Links for the openstreetmap.org-sidebar
// @description This script adds links to OSM Deep History for Nodes, Ways and Relations, OSMCha for Changesets as well as KartaView and Mapillary in the primary navigation when displayed on openstreetmap.org.
// @version     15
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
  var user_note_table;
  // other variables
  var thisUrl;
  var loc;
  var objectMatches;
  var mapMatches;
  var iZoom;
  var OsmObject = { id: "", type: "" };
  var OsmMap = { lat: "", lon: "", zoom : "" };
  var OsmApiMap = false;
  
  // parse the current URI into RegEx matches
  loc = window.location.toString();

  // URI matches for main map
  objectMatches = loc.match(/(changeset|node|way|relation|note)\/(\d+)/);
  if (objectMatches) {
    // get native DOM objects for main map
    sidebar_content = document.getElementById("sidebar_content");
    navbar_content = document.getElementsByClassName("primary")[0].getElementsByClassName("btn-group")[0];
    
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
    OsmApiMap = false;
  } else {
    OsmMap = getOsmApiCoords(OsmObject);
    OsmApiMap = true;
  }
  
  // URI matches for user pages
  notePageMatch = loc.match(/user\/([^\/]*)\/notes/);
  if (notePageMatch) {
    // get native DOM objects for user pages
    user_note_content = document.querySelector(".content-body");
    var button = getNoteToggleButton();
    user_note_table = user_note_content.querySelector(".note_list");
    user_note_tbody = user_note_table.querySelector("tbody");
    user_note_table.style.wordWrap = 'anywhere';
    const style = document.createElement('style');
    style.innerHTML = "td.nobr { white-space: nowrap; }";
    document.head.appendChild(style);
    button.addEventListener('click', function handleClick(event) {
      while (user_note_tbody.rows.length > 0) user_note_tbody.deleteRow(0);
      getOsmApiNotes(notePageMatch[1], user_note_tbody);
      var allParas = user_note_content.querySelectorAll("p");
      allParas.forEach(function(p) { if (p.innerHTML.includes("| Page")) { p.innerHTML = ""; } });
    });
    user_note_content.querySelector(".note_list").parentNode.insertBefore(button, user_note_content.querySelector(".note_list"));   
    //alert (user_note_content);
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
    if (loc.includes("#map=") || OsmApiMap) {
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
  anchor.title = "Show difference since note creation on Overpass";
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

// createNoteToggleButton
function getNoteToggleButton() {
  var button;
  button = document.createElement("input");
  button.type = "button";
  button.value = "Show open notes only";
  button.style.marginBottom = "5px";
  return button;
}

// get User notes from API
function getOsmApiNotes(display_name, oTable) {
  respJson = makeApiCall("https://api.openstreetmap.org/api/0.6/notes/search.json?display_name=" + display_name + "&closed=0");
  const thisJson = JSON.parse(respJson);
  var test = "";
  for(let n = 0; n < thisJson.features.length; n++) {
    var thisProp = thisJson.features[n].properties;
    var firstCom = thisProp.comments[0];
    var lastCom = thisProp.comments[thisProp.comments.length - 1];
    var newRow = document.createElement("tr");
    newRow.innerHTML = "<td><img alt=\"open\" src=\"/assets/open_note_marker-c8bded7588af7f6fcec923a12e2afbeadd630d285ca46992e54fefe15aac4496.png\" width=\"25\" height=\"40\"></td>";
    newRow.innerHTML += "<td class=\"nobr\"><a href=\"/note/" + thisProp.id + "\">" + thisProp.id + "</a></td>";
    if (firstCom.user === undefined) thisUser = ""; else thisUser = "<a href=\"/user/" + firstCom.user + "\">" + firstCom.user + "</a>";
    newRow.innerHTML += "<td class=\"nobr\">" + thisUser + "</td>";
    newRow.innerHTML += "<td>" + firstCom.html + "</td>";
    newRow.innerHTML += "<td class=\"nobr\">" + thisProp.date_created.replace(" ","<br/>").replace("<br/>UTC", " UTC") + "</td>";
    newRow.innerHTML += "<td class=\"nobr\">" + lastCom.date.replace(" ","<br/>").replace("<br/>UTC", " UTC") + "</td>";
    if (firstCom.user === decodeURI(display_name)) newRow.className = "creator";
    oTable.appendChild(newRow);
  }
}

function getOsmApiCoords(osmObject) {
  if (osmObject.type === "node") {
    respJson = makeApiCall("https://api.openstreetmap.org/api/0.6/node/" + osmObject.id + ".json");
    const thisJson = JSON.parse(respJson);
    OsmMap = {
      lat: thisJson.elements[0].lat,
      lon: thisJson.elements[0].lon,
      zoom: "18"
    }
    return OsmMap;
  }
  if (osmObject.type === "way" || osmObject.type === "relation") {
    respJson = makeApiCall("https://api.openstreetmap.org/api/0.6/" + osmObject.type + "/" + osmObject.id + "/full.json");
    const thisJson = JSON.parse(respJson);
    let elementCount = 0;
    let sumLon = 0;
    let sumLat = 0;
    thisJson.elements.forEach(function(o) {
      if (o.type === "node") {
        let sumLon = sumLon + parseFloat(o.lon);
        let sumLat = sumLat + parseFloat(o.lat);
        let elementCount = elementCount + 1;
      }
    }
    );
    OsmMap = {
      lat: (sumLat / elementCount),
      lon: (sumLon / elementCount),
      zoom: "18"
    }
    return OsmMap;
  }
  if (osmObject.type === "note") {
    respJson = makeApiCall("https://api.openstreetmap.org/api/0.6/notes/" + osmObject.id + ".json");
    const thisJson = JSON.parse(respJson);
    OsmMap = {
      lat: thisJson.geometry.coordinates[1],
      lon: thisJson.geometry.coordinates[0],
      zoom: "18"
    }
    return OsmMap;
  }
  if (osmObject.type === "changeset") {
    respJson = makeApiCall("https://api.openstreetmap.org/api/0.6/changeset/" + osmObject.id + ".json");
    const thisJson = JSON.parse(respJson);
    OsmMap = {
      lat: (thisJson.elements[0].minlat + thisJson.elements[0].maxlat) / 2,
      lon: (thisJson.elements[0].minlon + thisJson.elements[0].maxlon) / 2,
      zoom: "18"
    }
    return OsmMap;
  }
}

function makeApiCall(url) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", url, false);
  xmlHttp.send(null);
  return xmlHttp.responseText;
}