// ==UserScript==
// @name        Additional Links for the openstreetmap.org-sidebar
// @description This script adds links to OSM Deep History for Nodes, Ways and Relations and OSMCha for Changesets when displayed on openstreetmap.org.
// @version     2
// @grant       none
// @match https://www.openstreetmap.org/node/*
// @match https://www.openstreetmap.org/way/*
// @match https://www.openstreetmap.org/relation/*
// @match https://www.openstreetmap.org/changeset/*
// ==/UserScript==

var sidebar_content, newElement;
sidebar_content = document.getElementById('sidebar_content').getElementsByClassName("browse-section")[0];
var loc = window.location.pathname;

if (sidebar_content) {
	displayContainer = document.createElement('div');
	displayContainer.style.border = "1px solid #CCC";
	displayContainer.style.borderRadius = "3px";

	anchor = document.createElement('a');
	anchor.target = "_blank";

	if (loc.includes("changeset")) {
		var matches = loc.match(/changeset\/(\d*)/);
		anchor.href = "https://osmcha.org/changesets/" + matches[1];
		anchor.innerHTML = "<center>OSMCha for this Changeset</center>";
	} else {
		anchor.href = "https://osmlab.github.io/osm-deep-history/#" + loc;
		anchor.innerHTML = "<center>OSM Deep History</center>";
	}

	displayContainer.appendChild(anchor);
	sidebar_content.parentNode.insertBefore(displayContainer, sidebar_content);
}