import {parseXML, mapGet, mapSet} from "../../common/index.js";

interface TemplateCacheItem {
  template: string;
  xmlDocument: XMLDocument
}

let _templateCache: Map<string, TemplateCacheItem> | null = null;

export interface TemplateLocation {
  url: string;
  method?: string;
  headers?: {
    [name: string]: string
  };
  followRedirect?: boolean;
}

export function setCache(cache: { [key: string]: string }) {
  if (!cache) {
    throw new Error("invalid cache!");
  }
  if (_templateCache === null) {
    _templateCache = new Map();
    const keys = Object.keys(cache);
    for (const k of keys) {
      const template = cache[k];
      putTemplate(k, template);
    }
  } else {
    throw new Error("cannot reset cache");
  }
}

export function getTemplateFromLocation(location: TemplateLocation | string): Promise<TemplateCacheItem> | TemplateCacheItem {
  location = typeof location === "string" ? {
    url: location
  } : location;
  const template = getTemplate(location);
  if (template !== undefined) {
    return template;
  } else {
    return new Promise((resolve, reject) => {
      try {
        preLoad(location).then((template) => {
          resolve(template);
        }).catch(e => {
          // put a fake template to avoid preloading more times
          putTemplate(location, "");
          reject(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

function getTemplateKey(location: TemplateLocation | string): string {
  return typeof location === "string" ? location : `${location.url}`;
}

function getTemplate(location: string | TemplateLocation): TemplateCacheItem | undefined {
  const key = getTemplateKey(location);
  if (_templateCache) {
    //return _templateCache[key];
    return mapGet.call(_templateCache, key);
  }
}

function putTemplate(location: TemplateLocation | string, template: string): TemplateCacheItem {
  _templateCache = _templateCache !== null ? _templateCache : new Map<string, { template: string; xmlDocument: XMLDocument }>();
  const key = getTemplateKey(location);
  const xmlDocument: XMLDocument = parseXML(template);
  const item = {
    template,
    xmlDocument
  };
  mapSet.call(_templateCache, key, item);
  return item;
}

async function preLoad(location: string | TemplateLocation): Promise<TemplateCacheItem> {
  const isLocationString = typeof location === "string";
  const url = isLocationString ? location : location.url;
  const response = await fetch(url, isLocationString ? {} : {
    method: location.method
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`bad response status [${response.status}] from [${url}]`);
  }
  const template = await response.text();
  return putTemplate(location, template);
}
