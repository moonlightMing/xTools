'use strict';

const {clipboard, ipcRenderer, remote} = require ('electron');

const head = document.getElementById ('current-clipboard-text');
const list = document.getElementsByClassName ('list-group-item');

const observer = new MutationObserver (() => {
  const container = document.getElementById ('container');
  remote
    .getCurrentWindow ()
    .setSize (container.offsetWidth, container.offsetHeight);
});

observer.observe (container, {
  attributes: true,
  childList: true,
  subtree: true,
});

setInterval (() => {
  head.textContent = clipboard.readText ();
}, 500);

ipcRenderer.on ('copy-to-board', (_, index, content) => {
  list[index].textContent = `F${index}: ${content}`;
});
