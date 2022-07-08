export function deepEquals(A: any, B: any): boolean {
  //log(LOG_LEVEL.trace, "deepCompare(%o, %o)", A, B);
  if ((A === null && B !== null) || (B === null && A !== null)) {
    //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
    return false;
  }
  if ((A === undefined && B !== undefined) || (B === undefined && A !== undefined)) {
    //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
    return false;
  }
  if (A === null && B === null) {
    //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=true", A, B);
    return true;
  }
  if (A === undefined && B === undefined) {
    //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=true", A, B);
    return true;
  }
  if (typeof A !== typeof B) {
    //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
    return false;
  }
  if (A.prototype !== B.prototype || A.__proto__ !== B.__proto__) {
    //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
    return false;
  }
  if (A instanceof Date && B instanceof Date) {
    return A.getTime() === B.getTime();
  }
  if (typeof A === "object") {
    const aKeys = Object.keys(A);
    const bKeys = Object.keys(B);
    if (aKeys.length !== bKeys.length) {
      //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
      return false;
    }
    for (const i of aKeys) {
      if (A[i] !== B[i]) {
        const vA = A[i];
        const vB = B[i];
        if (!deepEquals(vA, vB)) {
          //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
          return false;
        }
      }
    }
  }

  switch (typeof A) {
    case "object":
      return true;
    case "number":
    case "bigint":
    case "boolean":
    case "function":
    case "symbol":
    case "string":
    case "undefined":
      const ret = A === B;
      //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=%s", A, B, ret);
      return ret;
  }
  //log(LOG_LEVEL.trace, "deepCompare(%o, %o)=true", A, B);
  return true;
}
