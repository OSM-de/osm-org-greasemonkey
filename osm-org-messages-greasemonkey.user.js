// ==UserScript==
// @name        Make openstreetmap.org messages downloadable
// @description This script allows to download OSM DMs as .eml-files
// @version     1
// @grant       none
// @copyright   2023, https://github.com/kmpoppe
// @license     MIT
// @namespace   https://github.com/OSM-de/osm-org-greasemonkey
// @updateURL   https://cdn.jsdelivr.net/gh/OSM-de/osm-org-greasemonkey@master/osm-org-messages-greasemonkey.user.js
// @installURL  https://cdn.jsdelivr.net/gh/OSM-de/osm-org-greasemonkey@master/osm-org-messages-greasemonkey.user.js
// @downloadURL https://cdn.jsdelivr.net/gh/OSM-de/osm-org-greasemonkey@master/osm-org-messages-greasemonkey.user.js
// @icon        https://www.openstreetmap.org/assets/favicon-16x16-474476c1b2381628a81361a9e2bf04b936d21f77c59e84b48c6c69ea376fb6cf.png
// @match       https://www.openstreetmap.org/messages/*
// ==/UserScript==

var oldHref = document.location.href;

window.onload = function() {
  modifyContent();
};

function modifyContent() {
  // parse the current URI into RegEx matches
  loc = window.location.toString();

  messageMatch = loc.match(/messages\/(\d+)/);
  if (messageMatch) {
    msgId = messageMatch[1];
    contentHeadObject = document.getElementsByClassName("content-heading");
    subjectObject = contentHeadObject[0].getElementsByTagName("h1");
    subjectString = subjectObject[0].innerText;
    headerInfo = document.getElementsByClassName("mb-3 border-bottom border-grey py-1 d-flex gap-1 flex-wrap");
    otherUserObject = headerInfo[0].getElementsByTagName("a");
    otherUserString = otherUserObject[0].innerText;
    dateTimeObject = headerInfo[0].getElementsByTagName("span");
    dateTimeString = dateTimeObject[0].innerText;
    msgContentObject = document.getElementsByClassName("richtext text-break");
    msgContentString = msgContentObject[0].innerHTML.replaceAll("#", "%23");
    meObject = document.getElementsByClassName("username");
    meString = meObject[0].innerHTML.trim();

    innerContentBtns = document.getElementsByClassName("btn btn-primary");
    direction = "s";
    if (innerContentBtns.length > 0 && /messages\/(\d+)\/reply/.test(innerContentBtns[0].outerHTML)) {
      direction = "r";
    }

    senderString = (direction == "s" ? meString : otherUserString);
    receiverString = (direction == "r" ? meString : otherUserString);

    dateTimeReg = dateTimeString.match(/(\d+) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4}) at (\d\d\:\d\d)/);
    dtObj = new Date(Date.parse(dateTimeReg[1] + " " + dateTimeReg[2].substring(0,3) + " " + dateTimeReg[3] + " " + dateTimeReg[4] + " UTC"));

    // Email creation sourced from https://stackoverflow.com/q/27951843
    var emlContent = "data:message/rfc822 eml;charset=utf-8,";
    emlContent += 'To: '+receiverString+'@users.openstreetmap.org\n';
    emlContent += 'From: '+senderString+'@users.openstreetmap.org\n';
    emlContent += 'Date: '+dtObj.toString()+'\n';
    emlContent += 'Subject: '+subjectString+'\n';
    emlContent += 'X-Unsent: 0'+'\n';
    emlContent += 'Content-Type: text/html'+'\n';
    emlContent += ''+'\n';
    emlContent += msgContentString;

    var encodedUri = encodeURI(emlContent); //encode spaces etc like a url
    var a = document.createElement('a'); //make a link in document
    var linkText = document.createTextNode("Download as .eml-file");
    a.appendChild(linkText);
    a.href = encodedUri;
    a.id = 'fileLink';
    a.download = msgId+'.eml';
    a.className = "btn btn-primary";
    a.style = "background-color:#00cf00;border-color:#00cf00";
    buttonsObject = document.getElementsByClassName("content-body")[0].getElementsByClassName("content-inner")[0].getElementsByTagName("div")[2];
    buttonsObject.appendChild(a);
  }
}