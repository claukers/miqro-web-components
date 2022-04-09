export function get(obj: any, attrPath: string, defaultValue?: any): any | undefined {
  defaultValue = defaultValue ? defaultValue : undefined;
  if (!obj || typeof obj !== "object") {
    return defaultValue !== undefined ? defaultValue : undefined
  }
  if (typeof attrPath !== "string") {
    throw new Error(`attrPath must be typeof string`);
  }
  const path = attrPath.split(".").reverse();
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
