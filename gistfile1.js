// ==UserScript==
// @name     Deep History osm.org
// @version  1
// @grant    none
// @match https://www.openstreetmap.org/node/*
// @match https://www.openstreetmap.org/way/*
// @match https://www.openstreetmap.org/relation/*
// ==/UserScript==

var sidebar_content, newElement;
sidebar_content = document.getElementById('sidebar_content').getElementsByClassName("browse-section")[0];

if (sidebar_content) {
  displayContainer = document.createElement('div');
  displayContainer.style.border = "1px solid #CCC";
  displayContainer.style.borderRadius = "3px"; 

  anchor = document.createElement('a');
  anchor.target = "_blank";
  anchor.href = "https://osmlab.github.io/osm-deep-history/#" + window.location.pathname;
  anchor.innerHTML = "<center>OSM Deep History</center>";

  displayContainer.appendChild(anchor);
  sidebar_content.parentNode.insertBefore(displayContainer, sidebar_content);
}