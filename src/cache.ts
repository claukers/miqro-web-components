let _templateCache: { [key: string]: string } | null = null;

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

interface TemplateLocation {
  url: string;
  method?: string;
  headers?: {
    [name: string]: string
  };
  followRedirect?: boolean;
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


export function getTemplateLocation(location: TemplateLocation | string): Promise<string> | string {
  location = typeof location === "string" ? {
    url: location
  } : location;
  const template = getTemplate(location);
  if (typeof template === "string") {
    return template;
  } else {
    // reload when loading finishes
    return preLoad(location);
  }
}

function hasTemplate(location: TemplateLocation | string | TemplateLocation): boolean {
  _templateCache = _templateCache !== null ? _templateCache : {};
  const key = getTemplateKey(location);
  return _templateCache[key] !== undefined;
}

function putTemplate(location: TemplateLocation | string, template: string): void {
  _templateCache = _templateCache !== null ? _templateCache : {};
  const key = getTemplateKey(location);
  _templateCache[key] = template;
}

async function preLoad(location: string | TemplateLocation): Promise<string> {
  const isLocationString = typeof location === "string";
  if (!hasTemplate(location)) {
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
  } else {
    return getTemplate(location) as string;
  }
}
