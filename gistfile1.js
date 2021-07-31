// ==UserScript==
// @name     Unnamed Script 403658
// @version  1
// @grant    none
// @match https://www.openstreetmap.org/node/*
// @match https://www.openstreetmap.org/way/*
// @match https://www.openstreetmap.org/relation/*
// ==/UserScript==

var sidebar_content, newElement;
sidebar_content = document.getElementById('sidebar_content').getElementsByClassName("browse-section")[0];

if (sidebar_content) {
    newElement = document.createElement('a');
  	newElement.href = "https://osmlab.github.io/osm-deep-history/#" + window.location.pathname;
  	newElement.innerHTML = "osm-deep-history";
  	
    sidebar_content.parentNode.insertBefore(newElement, sidebar_content);
}