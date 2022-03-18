export const getTagName = (component: {
  new(...params: any[]): HTMLElement;
  tagName?: string;
}) => component.hasOwnProperty("tagName") ? String(component.tagName) : pascalCaseToDash(component.name);

export const normalizePath = (path: string) => {
  if (path.length > 1 && path.charAt(path.length - 1) === "/") {
    path = path.substring(0, path.length - 1);
  }
  return path;
};

export class EventEmitter {

  constructor(public defaultOptions?: EventInit) {
  }

  public emit(event: string, detail: any, element: Element | ShadowRoot, eventOptions?: EventInit): void {
    const options = eventOptions ? eventOptions : this.defaultOptions;
    element.dispatchEvent(new CustomEvent(event, options ? {
      ...options,
      detail
    } : {
      detail
    }));
  }
}

const pascalCaseToDash = (v: string): string => {
  let ret = '', prevLowercase = false, prevIsNumber = false
  for (let s of v) {
    const isUppercase = s.toUpperCase() === s
    const isNumber = !isNaN(parseInt(s, 10))
    if (isNumber) {
      if (prevLowercase) {
        ret += '-'
      }
    } else {
      if (isUppercase && (prevLowercase || prevIsNumber)) {
        ret += '-'
      }
    }
    ret += s
    prevLowercase = !isUppercase
    prevIsNumber = isNumber
  }
  return ret.replace(/-+/g, '-').toLowerCase()
};
