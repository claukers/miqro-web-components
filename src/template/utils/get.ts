export function get(obj: any, attrPath: string | string[], defaultValue?: any): any | undefined {
  defaultValue = defaultValue !== undefined ? defaultValue : undefined;
  if (!obj || typeof obj !== "object") {
    return defaultValue !== undefined ? defaultValue : undefined
  }
  if (typeof attrPath !== "string" && !(attrPath instanceof Array)) {
    throw new Error(`attrPath must be typeof string or string[]`);
  }
  const path = (attrPath instanceof Array ? attrPath : attrPath.split(".")).reverse();
  if (path.filter(p => p === "__prototype__" || p === "__proto__").length > 0) {
    throw new Error(`invalid attrPath`);
  }
  let value = obj;
  while (path.length > 0) {
    const p = path.pop() as string;
    if (value[p] === undefined) {
      return defaultValue !== undefined ? defaultValue : undefined;
    }
    value = value[p];
  }
  return value;
}
