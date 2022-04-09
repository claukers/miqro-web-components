let _templateCache: { [key: string]: string } | null = null;

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
    _templateCache = cache;
  } else {
    throw new Error("cannot reset cache");
  }
}

export function getTemplateLocation(location: TemplateLocation | string): Promise<string> | string {
  location = typeof location === "string" ? {
    url: location
  } : location;
  const template = getTemplate(location);
  if (typeof template === "string") {
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

function getTemplate(location: string | TemplateLocation): string | undefined {
  const key = getTemplateKey(location);
  if (_templateCache) {
    return _templateCache[key];
  }
}

function putTemplate(location: TemplateLocation | string, template: string): void {
  _templateCache = _templateCache !== null ? _templateCache : {};
  const key = getTemplateKey(location);
  _templateCache[key] = template;
}

async function preLoad(location: string | TemplateLocation): Promise<string> {
  const isLocationString = typeof location === "string";
  const url = isLocationString ? location : location.url;
  const response = await fetch(url, isLocationString ? {} : {
    method: location.method
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`bad response status [${response.status}] from [${url}]`);
  }
  const template = await response.text();
  putTemplate(location, template);
  return template;
}
