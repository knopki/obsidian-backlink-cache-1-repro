/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BacklinkCachePlugin
});
module.exports = __toCommonJS(main_exports);

// BacklinkCachePlugin.ts
var import_obsidian = require("obsidian");
var BacklinkCachePlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this._linksMap = /* @__PURE__ */ new Map();
    this._backlinksMap = /* @__PURE__ */ new Map();
    this.DEBOUNCE_TIMEOUT_IN_MILLISECONDS = 1e3;
    this._handlersQueue = [];
    this.onload = async () => {
      this._defaultGetBacklinksForFile = this.app.metadataCache.getBacklinksForFile;
      this.app.workspace.onLayoutReady(() => {
        const noteFiles = this.app.vault.getMarkdownFiles().sort((a, b) => a.path.localeCompare(b.path));
        console.log(`Processing ${noteFiles.length} note files`);
        let i = 0;
        for (const noteFile of noteFiles) {
          i++;
          console.debug(`Processing ${i} / ${noteFiles.length} - ${noteFile.path}`);
          const cache = this.app.metadataCache.getFileCache(noteFile);
          if (cache) {
            this.processBacklinks(cache, noteFile.path);
          }
        }
        this.app.metadataCache.getBacklinksForFile = this.getBacklinksForFile.bind(this);
        this.registerEvent(this.app.metadataCache.on("changed", this.makeDebounced(this.handleMetadataChanged)));
        this.registerEvent(this.app.vault.on("rename", this.makeDebounced(this.handleFileRename)));
        this.registerEvent(this.app.vault.on("delete", this.makeDebounced(this.handleFileDelete)));
      });
    };
    this.onunload = async () => {
      this.app.metadataCache.getBacklinksForFile = this._defaultGetBacklinksForFile;
    };
    this.makeDebounced = (handler) => {
      return (...args) => {
        this._handlersQueue.push(() => handler.apply(this, args));
        this.processHandlersQueueDebounced();
      };
    };
    this.processHandlersQueue = () => {
      while (true) {
        const handler = this._handlersQueue.shift();
        if (!handler) {
          return;
        }
        handler();
      }
    };
    this.processHandlersQueueDebounced = (0, import_obsidian.debounce)(this.processHandlersQueue, this.DEBOUNCE_TIMEOUT_IN_MILLISECONDS);
    this.handleMetadataChanged = (file, data, cache) => {
      console.debug(`Handling cache change for ${file.path}`);
      this.removeLinkedPathEntries(file.path);
      this.processBacklinks(cache, file.path);
    };
    this.handleFileRename = (file, oldPath) => {
      console.debug(`Handling rename from ${oldPath} to ${file.path}`);
      this.removePathEntries(oldPath);
      if (file instanceof import_obsidian.TFile) {
        const cache = this.app.metadataCache.getFileCache(file);
        if (cache) {
          this.processBacklinks(cache, file.path);
        }
      }
    };
    this.handleFileDelete = (file) => {
      console.debug(`Handling deletion ${file.path}`);
      this.removePathEntries(file.path);
    };
    this.removePathEntries = (path) => {
      console.debug(`Removing ${path} entries`);
      this._backlinksMap.delete(path);
      this.removeLinkedPathEntries(path);
    };
    this.removeLinkedPathEntries = (path) => {
      var _a;
      console.debug(`Removing linked entries for ${path}`);
      const linkedNotePaths = this._linksMap.get(path) || [];
      for (const linkedNotePath of linkedNotePaths) {
        (_a = this._backlinksMap.get(linkedNotePath)) == null ? void 0 : _a.delete(path);
      }
      this._linksMap.delete(path);
    };
    this.getBacklinksForFile = (file) => {
      const notePathLinksMap = this._backlinksMap.get(file.path) || /* @__PURE__ */ new Map();
      const data = {};
      for (const [notePath, links] of notePathLinksMap.entries()) {
        data[notePath] = [...links].sort((a, b) => a.position.start.offset - b.position.start.offset);
      }
      return {
        data
      };
    };
    this.extractLinkPath = (link) => {
      return link.replace(/\u00A0/g, " ").normalize("NFC").split("#")[0];
    };
    this.processBacklinks = (cache, notePath) => {
      var _a;
      console.debug(`Processing backlinks for ${notePath}`);
      if (!this._linksMap.has(notePath)) {
        this._linksMap.set(notePath, /* @__PURE__ */ new Set());
      }
      const allLinks = [];
      if (cache.links) {
        allLinks.push(...cache.links);
      }
      if (cache.embeds) {
        allLinks.push(...cache.embeds);
      }
      for (const link of allLinks) {
        const linkFile = this.app.metadataCache.getFirstLinkpathDest(this.extractLinkPath(link.link), notePath);
        if (!linkFile) {
          continue;
        }
        let notePathLinksMap = this._backlinksMap.get(linkFile.path);
        if (!notePathLinksMap) {
          notePathLinksMap = /* @__PURE__ */ new Map();
          this._backlinksMap.set(linkFile.path, notePathLinksMap);
        }
        let linkSet = notePathLinksMap.get(notePath);
        if (!linkSet) {
          linkSet = /* @__PURE__ */ new Set();
          notePathLinksMap.set(notePath, linkSet);
        }
        linkSet.add(link);
        (_a = this._linksMap.get(notePath)) == null ? void 0 : _a.add(linkFile.path);
      }
    };
  }
};
