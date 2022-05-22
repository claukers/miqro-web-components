export function set<S>(obj: S, attrPath: string, value: any): S {
  const path = attrPath.split(".").reverse();
  let objRef: any = obj;
  while (path.length > 0) {
    const p = path.pop() as string;
    if (path.length === 0) {
      objRef[p] = value;
    } else {
      if (objRef[p] === undefined) {
        objRef[p] = {};
      }
      objRef = objRef[p];
    }
  }
  return obj;
}
