const fetch = require('node-fetch')
const fs = require('fs')

async function syncPages(pages, locationReferenceMap) {
  Promise.all(pages.map(page => syncPage(page, locationReferenceMap)))
}

async function syncPage(
  { id, title, hideTitle, sidebarLabel, contentURL, fileLocation },
  locationReferenceMap
) {
  const response = await fetch(contentURL)
  let remoteText = await response.text()
  // Fix the links
  if (
    locationReferenceMap &&
    Object.keys(locationReferenceMap).length !== 0 &&
    locationReferenceMap.constructor === Object
  ) {
    remoteText = replaceAll(remoteText, locationReferenceMap)
  }

  const header = `---
id: ${id}
title: ${title}
sidebar_label: ${sidebarLabel}
hide_title: ${hideTitle || false}
---
<!-- This file is generated by /website/scripts/sync-util.js - changes will be overwritten! -->
`
  const result = header.concat('\n').concat(remoteText)
  // this script will be run from the website directory => we need to go up one level
  fs.writeFileSync(`../${fileLocation}`, result)
}

function replaceAll(string, mapObject) {
  const regex = new RegExp(Object.keys(mapObject).join('|'), 'gi')
  return string.replace(regex, matched => mapObject[matched])
}

module.exports = {
  syncPages,
}
