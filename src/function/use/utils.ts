export function getQueryValue(name: string, defaultValue?: string[] | string | null): string[] | string | null {
  const ret = new URL(window.location.href).searchParams.getAll(name);
  if (ret.length === 0) {
    return defaultValue !== undefined ? defaultValue : null;
  }
  return ret && ret.length === 1 ? ret[0] : ret;
}

export function setQueryValue(name: string, value: string[] | string | null): void {
  const url = new URL(window.location.href);
  if (value instanceof Array) {
    for (const v of value) {
      url.searchParams.append(name, v)
    }
  } else if (value !== null) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
  window.history.pushState(null, null as any, url.toString());
  window.dispatchEvent(new PopStateEvent("popstate"));
}
