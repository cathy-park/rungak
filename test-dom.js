import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const dom = new JSDOM(`<!DOCTYPE html><body><div id="root"></div></body>`, {
  url: "http://localhost",
  runScripts: "dangerously",
  resources: "usable"
});
dom.window.console.error = (msg) => { fs.appendFileSync('dom-error.log', msg + '\n'); };
dom.window.console.log = (msg) => { fs.appendFileSync('dom-log.log', msg + '\n'); };

// This is not going to easily run Vite compiled output because it has ES modules.
