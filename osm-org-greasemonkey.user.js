// ==UserScript==
// @name        Additional Links for the openstreetmap.org-sidebar
// @description This script adds links to OSM Deep History for Nodes, Ways and Relations, OSMCha for Changesets as well as KartaView and Mapillary in the primary navigation when displayed on openstreetmap.org.
// @version     30
// @grant       none
// @copyright   2021-2024, https://github.com/joshinils and https://github.com/kmpoppe
// @license     MIT
// @namespace   https://github.com/OSM-de/osm-org-greasemonkey
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
          osmLocCookie = getCookie("_osm_location");
          loc = window.location.toString();
          layerMatches = loc.match(/layers=([A-Z]*)/);
          setCookie("_osm_location", osmLocCookie.substring(0, osmLocCookie.lastIndexOf("|")+1) + layerMatches[1], 3650);
        }
      });
    });
  observer.observe(bodyList, config);
  
  // make sidebar resizable
  if (document.getElementById("sidebar") != null) {
    document.getElementById("sidebar").style.cssText = `
  float: left;
  min-width: 350px;
  background: #fff;
  overflow: auto;
  resize: horizontal;
  max-height: fit-content;
  max-width: fit-content;
  `;
  }
  if (document.getElementById("sidebar_content") != null) {
    document.getElementById("sidebar_content").style.cssText = `
  width: unset !important;
  `;
  }
  
  modifyContent();
  
  document.addEventListener("keydown", (event) => {
    modifyLayers(event);
  });

};

function modifyLayers(event) {
  if (event.altKey) {
	  // TODO: Togglable Overlay Layers don't work correctly right now because the events don't get fired solely by chaning the URL
    blockAction = false;
    toggle = false;
    switch (event.key) {
      case "1": { layer = "M"; break; }
      case "2": { layer = "Y"; break; }
      case "3": { layer = "C"; break; }
      case "4": { layer = "T"; break; }
      case "5": { layer = "O"; break; }
      case "6": { layer = "H"; break; }
      /*
      case "7": { layer = "N"; formCheckInput = 0; toggle = true; break; }
      case "8": { layer = "D"; formCheckInput = 1; toggle = true; break; }
      case "9": { layer = "G"; formCheckInput = 2; toggle = true; break; }
      */
      default:  { blockAction = true; break;}
    }
    if (!blockAction) {
      loc = window.location.toString();
      layerMatches = loc.match(/layers=([A-Z]*)/);
      if (layerMatches) {
        if (toggle) {
          if (newLayer.includes(layer)) {
            newLayer = newLayer.replaceAll(layer, "");
            document.getElementsByClassName("form-check-input")[formCheckInput].checked = false;
          } else {
            newLayer = newLayer + layer;
            document.getElementsByClassName("form-check-input")[formCheckInput].checked = true;
          }
        } else {
          newLayer = layerMatches[0].replace(/[CHTOY]/g, "") + layer;
        }
      } else {
        if (layer !== "") newLayer = "layers=" + layer;
      }
      window.location.href = loc.replace(/(\&?)layers=([A-Z]*)/, "") + "&" + newLayer;
    }
  }
}

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
  
  if (mapMatches || objectMatches) {
    navbar_content = document.getElementsByClassName("primary")[0].getElementsByClassName("btn-group")[0];
  }

  // URI matches for user pages
  notePageMatch = loc.match(/user\/([^\/]*)\/notes/);
  if (notePageMatch) {
    // get native DOM objects for user pages
    user_note_content = document.querySelector(".content-body");
    user_note_table = user_note_content.querySelector(".note_list");
    user_note_tbody = user_note_table.querySelector("tbody");
    // add styles re wrapping in the table
    user_note_table.style.wordWrap = 'anywhere';
    const style = document.createElement('style');
    style.innerHTML = ".nobr { white-space: nowrap; }";
    document.head.appendChild(style);
    // create button
    var button = getNoteToggleButton();
    button.addEventListener('click', function handleClick(event) {
      if (button.value === "Show open notes only") {
        // remove server side table rows
        while (user_note_tbody.rows.length > 0) user_note_tbody.deleteRow(0);
        // add API table rows
        getOsmApiNotes(notePageMatch[1], user_note_tbody);
        // remove pagination
        var allParas = user_note_content.querySelectorAll("p");
        allParas.forEach(function(p) { if (p.innerHTML.includes("| Page")) { p.innerHTML = ""; } });
        button.value = "Reload original page";
        // replace th for sorting
        user_note_thead = user_note_table.querySelector("thead").children[0];
        var newTh = document.createElement("th");
        newTh.innerHTML = "Created at<br/>&#8645;";
        newTh.style.cursor = "pointer";
        newTh.className = "nobr";
        newTh.title = "Click to sort table";
        newTh.addEventListener('click', function handleClick(event) { sortNotesTable(4); });
        user_note_thead.replaceChild(newTh, user_note_thead.children[4]);
        var newTh = document.createElement("th");
        newTh.innerHTML = "Last changed<br/>&#8645;";
        newTh.title = "Click to sort table";
        newTh.style.cursor = "pointer";
        newTh.className = "nobr";
        newTh.addEventListener('click', function handleClick(event) { sortNotesTable(5); });
        user_note_thead.replaceChild(newTh, user_note_thead.children[5]);
      } else {
        window.location.reload();
      }
    });
    user_note_content.querySelector(".note_list").parentNode.insertBefore(button, user_note_content.querySelector(".note_list"));   
  }

  // Add links to the sidebar (node, way, relation, changeset, note)
  if (sidebar_content) {
    displayContainer = document.createElement("div");
    displayContainer.id = "GM-CONTA";
    displayContainer.className = "browse-tag-list btn-group-sm";
		displayContainer.style.textAlign = "center";

    // Notes ONLY
    if (OsmObject.type === "note") {
      // Overpass History
      note_details = document.getElementById("sidebar_content").getElementsByClassName("details")[0];
      note_location = note_details.getAttribute("data-coordinates");
      const note_time = new Date(Date.parse(note_details.querySelector("abbr").getAttribute("title"))).toISOString();
      thisUrl = "http://overpass-turbo.eu/?Q=%5Bdiff%3A%22" + note_time + "%22%5D%3B%28nw%28around%3A~~radius~~%2C" + note_location + "%29%3B%29%3Bout+body%3B%3E%3Bout+skel+qt%3B&R";
      createOrUpdateOverpassHistory("GM-OVERP", displayContainer, thisUrl, "<span style=\"color:rgba(0,0,0,.7);font-weight:700;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;\">Overpass</span> History", "btn btn-outline-primary");
    }
    // Changesets ONLY
    if (OsmObject.type === "changeset") {
      // OSMCha
      thisUrl = "https://osmcha.org/changesets/" + OsmObject.id;
      createOrUpdate("GM-OMSCH", displayContainer, thisUrl, "<span style=\"color:#666\"><strong style=\"color: #448ee4\">OSM</strong>Cha</span> for this Changeset", "btn btn-outline-primary");
    }
    // Nodes, Ways, Relations ONLY
    if (new RegExp(["node","way","relation"].join("|")).test(OsmObject.type)) {
      // OSM Deep History
      thisUrl = "https://osmlab.github.io/osm-deep-history/#/" + OsmObject.type + "/" + OsmObject.id;
      createOrUpdate("GM-OMSDH", displayContainer, thisUrl, "OSM Deep History", "btn btn-outline-primary");
      thisUrl = "https://nominatim.openstreetmap.org/ui/details.html?osmtype=" + OsmObject.type.substring(0, 1).toUpperCase() + "&osmid=" + OsmObject.id;
      // Nominatim Details
      createOrUpdate("GM-NOMIN", displayContainer, thisUrl, "Nominatim Details", "btn btn-outline-primary");
      
      // Create Links out to datasets that aren't provided by the openstreetmap website github
      tagList = document.querySelector("table.browse-tag-list tbody");
      if (tagList != null) {
        rows = tagList.querySelectorAll("tr");
        for (iRow = 0; iRow < rows.length; iRow++) {
          tagK = rows[iRow].children[0].innerText;
          tagV = rows[iRow].children[1].innerText;
          newTagV = returnNewValueContent(tagK, tagV);
          if (newTagV != tagV) rows[iRow].children[1].innerHTML = newTagV;
        }
      }
      
    }
    if (!document.getElementById("GM-CONTA")) {
      sidebar_content.getElementsByTagName('div')[2].parentNode.insertBefore(displayContainer, sidebar_content.getElementsByTagName('div')[2]);
    }
  }

  // Add links to the primary navigation bar
  if (navbar_content) {
    if (loc.includes("#map=") || OsmApiMap) {
      // Mapillary
      thisUrl = "https://www.mapillary.com/app/?lat=" + OsmMap.lat + "&lng=" + OsmMap.lon + "&z=" + OsmMap.zoom;
      createOrUpdate("GM-MAPIL", navbar_content, thisUrl, "<strong style=\"color:#05cb63\">M</strong><span style=\"color:#212b36\">apillary<span>", "btn btn-outline-primary");
      // KartaView
      thisUrl = "https://kartaview.org/map/@" + OsmMap.lat + "," + OsmMap.lon + "," + OsmMap.zoom + "z";
      createOrUpdate("GM-KARTA", navbar_content, thisUrl, "<strong style=\"color:#0C1D2E\">Karta</strong><span style=\"color:#635BFF\">View</span>", "btn btn-outline-primary");
      // Bing Aerial
      thisUrl = "https://www.bing.com/maps?cp=" + OsmMap.lat + "%7E" + OsmMap.lon + "&lvl=" + (parseInt(OsmMap.zoom)+1).toString() + "&style=a";
      createOrUpdate("GM-BING", navbar_content, thisUrl, "<span style=\"color:#737373\">Bing Maps</span>", "btn btn-outline-primary", "BingMaps Aerial Layer");
      // Mapilio
      thisUrl = "https://mapilio.com/app?lat=" + OsmMap.lat + "&lng=" + OsmMap.lon + "&zoom=" + OsmMap.zoom;
      createOrUpdate("GM-MAILO", navbar_content, thisUrl, "<span style=\"color:#191919\">mapili</strong><span style=\"color:#0056F1\">o</span>", "btn btn-outline-primary");
      // Discourse Community
      thisUrl = "https://community.openstreetmap.org/";
      createOrUpdate("GM-COMMU", navbar_content, thisUrl, "<span style=\"color:\">OSM</span> <strong style=\"color:\">Community</strong>", "btn btn-outline-primary", "OpenStreetMap Community Discourse");
      // Wiki
      thisUrl = "https://wiki.openstreetmap.org/wiki/Main_Page";
      createOrUpdate("GM-WIKIP", navbar_content, thisUrl, "<span style=\"color:\">OSM</span> <strong style=\"color:\">Wiki</strong>", "btn btn-outline-primary", "OpenStreetMap Wiki Main Page");
    }
  }
}

// Create, Update and DOM Elements general
function createOrUpdate(id, targetObject, thisUrl, text, className = "", title = "") {
  var existingAnchor = document.getElementById(id);
  if (existingAnchor) {
    existingAnchor.href = thisUrl;
  } else {
    targetObject.appendChild(
      getAnchorElement(
        id,
        thisUrl,
        text,
        className,
        title
      )
    );
  }
}

function getAnchorElement(id, url, text, className = "", title = "", target = "_blank") {
  var anchor;
  anchor = document.createElement("a");
  anchor.id = id;
  anchor.target = target;
  anchor.href = url;
  anchor.title = title;
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
  anchor = document.createElement("span");
  anchor.id = id;
  anchor.target = target;
  anchor.innerHTML = "<center><span style='color:#24d;cursor:pointer'>" + text + "</span></center>";
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

// non-JQuery Table sorting (Source: https://www.w3schools.com/howto/howto_js_sort_table.asp)
function sortNotesTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  user_note_table = user_note_content.querySelector(".note_list");
  table = user_note_table.querySelector("tbody");
  switching = true;
  // Set the sorting direction to ascending:
  dir = "asc"; 
  // Make a loop that will continue until no switching has been done:
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (changed from source, as we have a tbody here, not a table with headers) */
    for (i = 0; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;      
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

function returnNewValueContent(key, value) {
  returnValue = value;
  key = key.toLowerCase();
  url = "";
  title = "";
  replArray = [
    // FR: Museofile (Ministère de la culture)
    { keys: [ "ref:fr:museofile" ], url: "https://www.pop.culture.gouv.fr/notice/museo/~~value~~", title: "Ministère de la culture" },
    // GB-EN: Historic England
    { keys: [ "he_ref", "ref:gb:nhle" ], url: "https://historicengland.org.uk/listing/the-list/results/?searchType=NHLE+Simple&search=~~value~~", title: "Historic England List" },
		// GB-SC: Historic Environment Scotland
    { keys: [ "ref:gb:hs" ], url: "https://portal.historicenvironment.scot/designation/~~value~~", title: "Historic Environment Scotland" },
    // GB: FHRS
    { keys: [ "fhrs:id" ], url: "https://ratings.food.gov.uk/business/~~value~~", title: "UK Food Hygiene Rating System" },
    // IE: National Index of Architectural Heritage
    { keys: [ "ref:ie:niah" ], url: "https://www.buildingsofireland.ie/buildings-search/building/~~value~~/-", title: "National Index of Architectural Heritage" },
    // NZ: Department of Conservation
    { keys: [ "ref:doc" ], url: "https://www.doc.govt.nz/search-results/?query=~~value~~", title: "Department of Conservation" },
    // World: Historical Markers Database
    { keys: [ "ref:hmdb" ], url: "https://www.hmdb.org/m.asp?m=~~value~~", title: "Historical Markers Database" },
    // World: ISIL, BE
    { keys: [ "ref:isil"], regex: new RegExp("BE-\d*"), url: "http://isil.kbr.be/search.php?query=~~value~~&lang=en&type=ISIL", title: "ISIL (Belgium)" },
    // World: ISIL, DE
    { keys: [ "ref:isil"], regex: new RegExp("DE-\d*"), url: "https://sigel.staatsbibliothek-berlin.de/suche?isil=~~value~~", title: "ISIL (Germany)" },
    // World: ISIL, IT
    { keys: [ "ref:isil"], regex: new RegExp("IT-\d*"), url: "https://anagrafe.iccu.sbn.it/it/ricerca/ricerca-semplice/dettaglio.html?monocampo=~~value~~", title: "ISIL (Italy)" },
    // World: ISIL, NO
    { keys: [ "ref:isil"], regex: new RegExp("NO-\d*"), url: "https://www.nb.no/basebibliotek/search?q=~~value~~", title: "ISIL (Norway)" },
    // World: Mapillary
    { keys: [ "mapillary" ], url: "https://www.mapillary.com/app/?focus=photo&pKey=~~value~~", title: "Mapillary" },
    // World: OpenPlaques
    { keys: [ "openplaques:id" ], url: "https://openplaques.org/plaques/~~value~~", title: "OpenPlaques" },
    // World: sketchfab
    { keys: [ "sketchfab" ], url: "https://sketchfab.com/3d-models/~~value~~", title: "Sketchfab" },
    // World: UNESCO World Heritage Sites
    { keys: [ "ref:whc" ], url: "https://whc.unesco.org/en/list/~~value~~", title: "UNESCO World Heritage Centre" }
  ];
  replArray.forEach(e => {
    if (!value.startsWith("http") && e.keys.includes(key)) {
      if (!e.hasOwnProperty("regex") || (e.hasOwnProperty("regex") && value.match(e.regex))) {
        returnValue = "<a href=\"" + e.url.replace("~~value~~", value) + "\" target=\"_blank\" title=\"" + e.title + " [Added by GreaseMonkey]\">" + value + "</a>";
      }
    }
  });
  return returnValue;
}

function getCookie(cName) {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie); //to be careful
  const cArr = cDecoded .split('; ');
  let res;
  cArr.forEach(val => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  })
  return res;
}
function setCookie(cName, cValue, expDays) {
  let date = new Date();
  date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}
