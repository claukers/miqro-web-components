// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const URLSearchParamsGetAll = URLSearchParams.prototype.getAll;
const URLSearchParamsSet = URLSearchParams.prototype.set;
const URLSearchParamsAppend = URLSearchParams.prototype.append;
const URLSearchParamsDelete = URLSearchParams.prototype.delete;
const mutationObserverObserve = MutationObserver.prototype.observe;
const mutationObserverDisconnect = MutationObserver.prototype.disconnect;
const windowDispatchEvent = window.dispatchEvent;
const windowAddEventListener = window.addEventListener;
const windowRemoveEventListener = window.removeEventListener;
const weakMapGet = WeakMap.prototype.get;
const weakMapHas = WeakMap.prototype.has;
const weakMapSet = WeakMap.prototype.set;
const weakMapDelete = WeakMap.prototype.delete;
Map.prototype.keys;
const mapGet = Map.prototype.get;
const mapSet = Map.prototype.set;
Map.prototype.delete;
const LOG_LEVEL = {
    info: "info",
    debug: "debug",
    trace: "trace",
    warn: "warn",
    error: "error"
};
const LOG_LEVEL_PRIORITY = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    none: 5
};
const DEFAULT_LEVEL = LOG_LEVEL_PRIORITY.warn;
let currentLogLevel = null;
function log(level, text, ...args) {
    if (currentLogLevel === null) {
        currentLogLevel = DEFAULT_LEVEL;
    }
    if (currentLogLevel <= LOG_LEVEL_PRIORITY[level]) {
        console[level === "trace" ? "debug" : level](text, ...args);
    }
}
function getQueryValue(name, defaultValue) {
    const ret = URLSearchParamsGetAll.call(new URL(window.location.href).searchParams, name);
    if (ret.length === 0) {
        return defaultValue !== undefined ? defaultValue : null;
    }
    return ret && ret.length === 1 ? ret[0] : ret;
}
function setQueryValue(name, value) {
    const url = new URL(window.location.href);
    if (value instanceof Array) {
        for (const v of value){
            URLSearchParamsAppend.call(url.searchParams, name, v);
        }
    } else if (value !== null) {
        URLSearchParamsSet.call(url.searchParams, name, value);
    } else {
        URLSearchParamsDelete.call(url.searchParams, name);
    }
    window.history.pushState(null, "", String(url));
    windowDispatchEvent(new PopStateEvent("popstate"));
}
function nodeList2Array(childNodes) {
    const childrenNodes = [];
    if (childNodes) {
        for(let i = 0; i < childNodes.length; i++){
            childrenNodes.push(childNodes[i]);
        }
    }
    return childrenNodes;
}
const DOMParserParseFromString = DOMParser.prototype.parseFromString;
function parseXML(xml) {
    return DOMParserParseFromString.call(new DOMParser(), `<root>${xml}</root>`, "text/xml");
}
function get(obj, attrPath, defaultValue) {
    defaultValue = defaultValue !== undefined ? defaultValue : undefined;
    if (!obj || typeof obj !== "object") {
        return defaultValue !== undefined ? defaultValue : undefined;
    }
    if (typeof attrPath !== "string" && !(attrPath instanceof Array)) {
        throw new Error(`attrPath must be typeof string or string[]`);
    }
    const path = (attrPath instanceof Array ? attrPath : attrPath.split(".")).reverse();
    if (path.filter((p)=>p === "__prototype__" || p === "__proto__").length > 0) {
        throw new Error(`invalid attrPath`);
    }
    let value = obj;
    while(path.length > 0){
        const p = path.pop();
        if (value[p] === undefined) {
            return defaultValue !== undefined ? defaultValue : undefined;
        }
        value = value[p];
    }
    return value;
}
function set(obj, attrPath, value) {
    if (typeof attrPath !== "string" && !(attrPath instanceof Array)) {
        throw new Error(`attrPath must be typeof string or string[]`);
    }
    const path = (attrPath instanceof Array ? attrPath : attrPath.split(".")).reverse();
    if (path.filter((p)=>p === "__prototype__" || p === "__proto__").length > 0) {
        throw new Error(`invalid attrPath`);
    }
    let objRef = obj;
    while(path.length > 0){
        const p = path.pop();
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
function deepEquals(A, B) {
    if (A === null && B !== null || B === null && A !== null) {
        return false;
    }
    if (A === undefined && B !== undefined || B === undefined && A !== undefined) {
        return false;
    }
    if (A === null && B === null) {
        return true;
    }
    if (A === undefined && B === undefined) {
        return true;
    }
    if (typeof A !== typeof B) {
        return false;
    }
    if (A.prototype !== B.prototype || A.__proto__ !== B.__proto__) {
        return false;
    }
    if (A instanceof Date && B instanceof Date) {
        return A.getTime() === B.getTime();
    }
    if (typeof A === "object") {
        const aKeys = Object.keys(A);
        const bKeys = Object.keys(B);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        for (const i of aKeys){
            if (A[i] !== B[i]) {
                const vA = A[i];
                const vB = B[i];
                if (!deepEquals(vA, vB)) {
                    return false;
                }
            }
        }
    }
    switch(typeof A){
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
            return ret;
    }
    return true;
}
let _templateCache = null;
function getTemplateFromLocation(location1) {
    location1 = typeof location1 === "string" ? {
        url: location1
    } : location1;
    const template = getTemplate(location1);
    if (template !== undefined) {
        return template;
    } else {
        return new Promise((resolve, reject)=>{
            try {
                preLoad(location1).then((template)=>{
                    resolve(template);
                }).catch((e)=>{
                    putTemplate(location1, "");
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}
function getTemplateKey(location1) {
    return typeof location1 === "string" ? location1 : `${location1.url}`;
}
function getTemplate(location1) {
    const key = getTemplateKey(location1);
    if (_templateCache) {
        return mapGet.call(_templateCache, key);
    }
}
function putTemplate(location1, template) {
    _templateCache = _templateCache !== null ? _templateCache : new Map();
    const key = getTemplateKey(location1);
    const xmlDocument = parseXML(template);
    const item = {
        template,
        xmlDocument
    };
    mapSet.call(_templateCache, key, item);
    return item;
}
async function preLoad(location1) {
    const isLocationString = typeof location1 === "string";
    const url = isLocationString ? location1 : location1.url;
    const response = await fetch(url, isLocationString ? {} : {
        method: location1.method
    });
    if (response.status < 200 || response.status >= 300) {
        throw new Error(`bad response status [${response.status}] from [${url}]`);
    }
    const template = await response.text();
    return putTemplate(location1, template);
}
function getTemplateTokenValue(str) {
    if (str && typeof str === "string" && str.length > 3 && str.charAt(0) === "{" && str.charAt(str.length - 1) === "}") {
        const path = str.substring(1, str.length - 1);
        if (!path || path.indexOf(" ") !== -1) {
            return undefined;
        } else {
            return path;
        }
    }
    return undefined;
}
const re = /{[^%^{^}^\s]+}/g;
function textTemplateReplace(value, functionBind) {
    if (typeof value === "function") {
        const callback = value.bind(functionBind);
        return String(callback());
    } else {
        if (value !== undefined) {
            return String(value);
        } else {
            return "";
        }
    }
}
function evaluateTextTemplateForAttribute(textContent, values) {
    return textContent.replace(re, (match)=>{
        const path = getTemplateTokenValue(match);
        if (path) {
            const value = get(values, path);
            return textTemplateReplace(value, values.this);
        } else {
            return match;
        }
    });
}
function removeChild(c) {
    if (c.ref) {
        if (c.parent) {
            removeChildren(c.parent, c.ref);
        } else {
            c.ref.remove();
        }
    }
}
function removeChildrenFrom(old, from) {
    const splicedOld = old.splice(from);
    splicedOld.forEach(removeChild);
}
function appendChildren(root, children) {
    if (children instanceof Array) {
        for (const cR of children){
            root.appendChild(cR);
        }
    } else {
        root.appendChild(children);
    }
}
function removeChildren(root, children) {
    if (children instanceof Array) {
        for (const cR of children){
            root.removeChild(cR);
        }
    } else {
        root.removeChild(children);
    }
}
class VDOMNode {
    constructor(type){
        this.type = type;
    }
    create(parent) {
        throw new Error("not implemented!");
    }
    update(ref) {
        if (!ref) {
            throw new Error("bad ref!");
        }
        if (this.ref && this.ref !== ref) {
            throw new Error("already created!");
        }
        if (!this.ref) {
            this.ref = ref;
        }
        return false;
    }
    disconnect(element) {}
    compare(other) {
        return other.type === this.type;
    }
    toString() {
        return `${this.type} TemplateNode`;
    }
}
function renderVDOMDiffOn(root, current, old) {
    old = old ? [
        ...old
    ] : [];
    current = current ? [
        ...current
    ] : [];
    let i;
    let ret = false;
    for(i = 0; i < current.length; i++){
        const currentTemplateNode = current[i];
        const oldTemplateNode = old[i];
        if (oldTemplateNode === undefined) {
            ret = true;
            const createdRef = currentTemplateNode.create(root);
            appendChildren(root, createdRef);
        } else {
            if (oldTemplateNode.type !== currentTemplateNode.type) {
                ret = true;
                removeChildrenFrom(old, i);
                const createdRef1 = currentTemplateNode.create(root);
                appendChildren(root, createdRef1);
            } else {
                const compareRet = currentTemplateNode.compare(oldTemplateNode);
                if (!compareRet) {
                    ret = true;
                    removeChildrenFrom(old, i);
                    const createdRef2 = currentTemplateNode.create(root);
                    appendChildren(root, createdRef2);
                } else {
                    const currentRef = oldTemplateNode.ref;
                    if (!currentRef) {
                        debugger;
                    }
                    const oldChildren = oldTemplateNode.children;
                    ret = currentTemplateNode.update(currentRef) ? true : ret;
                    ret = renderVDOMDiffOn(currentRef, currentTemplateNode.children, oldChildren) ? true : ret;
                }
            }
        }
    }
    if (old) {
        removeChildrenFrom(old, i);
    }
    return ret;
}
class VDOMText extends VDOMNode {
    constructor(textContent){
        super("Text");
        this.textContent = textContent;
    }
    create(parent) {
        if (this.ref) {
            throw new Error("already created!");
        }
        this.parent = parent;
        const ref = document.createTextNode("");
        this.update(ref);
        return ref;
    }
    update(ref) {
        super.update(ref);
        if (ref.textContent !== this.textContent) {
            ref.textContent = this.textContent;
            return true;
        }
        return false;
    }
}
class TemplateHTMLElementRefNode extends VDOMNode {
    constructor(ref){
        super("HTMLElementRef");
        this.ref = ref;
    }
    create(parent) {
        this.parent = parent;
        this.update(this.ref);
        return this.ref;
    }
    compare(other) {
        return super.compare(other) && other.ref === this.ref;
    }
}
function renderTextNode(node, values) {
    let ret = [];
    if (node.textContent) {
        const firstTextNode = new VDOMText("");
        let currentTextNode = firstTextNode;
        firstTextNode.textContent = node.textContent.replace(re, (match)=>{
            const path = getTemplateTokenValue(match);
            if (path) {
                let value = get(values, path);
                if (typeof value === "function") {
                    const callback = value.bind(values.this);
                    value = callback();
                }
                const isNodeArray = value instanceof Array && value.filter((v)=>!(v instanceof Node)).length === 0;
                if (isNodeArray || value instanceof HTMLElement) {
                    ret.push(currentTextNode);
                    const refs = isNodeArray ? value : [
                        value
                    ];
                    ret = ret.concat(refs.map((ref)=>new TemplateHTMLElementRefNode(ref)));
                    currentTextNode = new VDOMText("");
                    return "";
                } else {
                    if (ret.length === 0) {
                        return String(value);
                    } else {
                        currentTextNode.textContent += String(value);
                        return "";
                    }
                }
            } else {
                if (ret.length === 0) {
                    return match;
                } else {
                    currentTextNode.textContent += match;
                    return "";
                }
            }
        });
        if (currentTextNode.textContent !== "") {
            ret.push(currentTextNode);
        }
    }
    return ret;
}
const DATA_FOR_EACH = "data-for-each";
const DATA_FOR_EACH_ITEM = "data-for-each-item";
const DATA_REF = "data-ref";
const DATA_ON = "data-on-";
const DATA_IF = "data-if";
const DATA_IFN = "data-ifn";
const DATA_STATE = "data-state";
async function dataForEach(node, values, cb) {
    const forEachValue = node.getAttribute(DATA_FOR_EACH);
    const forEachItemValue = node.getAttribute(DATA_FOR_EACH_ITEM);
    if (forEachValue !== null) {
        const ret = [];
        const forEachPath = getTemplateTokenValue(forEachValue);
        let value = forEachPath && get(values, forEachPath);
        value = typeof value === "function" ? value.bind(values.this)() : value;
        if (forEachPath && value && value instanceof Array) {
            const vValues = {
                ...values
            };
            for(let index = 0; index < value.length; index++){
                vValues[forEachItemValue !== null ? forEachItemValue : "item"] = value[index];
                vValues.index = index;
                const r = await cb(node, vValues);
                if (r) {
                    ret.push(r);
                }
            }
            return ret;
        } else {
            log(LOG_LEVEL.error, "invalid value for %s [%s]=[%o] for [%o]", DATA_FOR_EACH, forEachValue, value, values.this);
            throw new Error(`invalid value for ${DATA_FOR_EACH}`);
        }
    } else {
        const ret1 = await cb(node, values);
        return ret1 ? [
            ret1
        ] : [];
    }
}
function dataIfn(node, values) {
    const ifnValue = node.getAttribute(DATA_IFN);
    if (ifnValue !== null) {
        const ifnPath = getTemplateTokenValue(ifnValue);
        if (!ifnPath) {
            log(LOG_LEVEL.error, "invalid value for %s [%s] for [%o]", DATA_IFN, ifnValue, values.this);
            throw new Error(`invalid value for ${DATA_IFN}`);
        }
        let value = ifnPath && get(values, ifnPath);
        value = typeof value === "function" ? value.bind(values.this)() : value;
        return !!!value;
    } else {
        return true;
    }
}
function dataIf(node, values) {
    const ifValue = node.getAttribute(DATA_IF);
    if (ifValue !== null) {
        const ifPath = getTemplateTokenValue(ifValue);
        if (!ifPath) {
            log(LOG_LEVEL.error, "invalid value for %s [%s] for [%o]", DATA_IF, ifValue, values.this);
            throw new Error(`invalid value for ${DATA_IF}`);
        }
        let value = ifPath && get(values, ifPath);
        value = typeof value === "function" ? value.bind(values.this)() : value;
        return !!value;
    } else {
        return true;
    }
}
const IGNORE_ATTRIBUTES = [
    DATA_REF,
    DATA_IF,
    DATA_STATE,
    DATA_FOR_EACH,
    DATA_FOR_EACH_ITEM
];
function dataOnAndOtherAttributes(node, values, childElement) {
    const attributes = node.getAttributeNames();
    for (const attribute of attributes){
        if (IGNORE_ATTRIBUTES.indexOf(attribute) === -1) {
            const attributeValue = node.getAttribute(attribute);
            if (attributeValue) {
                if (attribute.indexOf(DATA_ON) === 0) {
                    const eventName = attributeValue ? attribute.substring(DATA_ON.length) : undefined;
                    const dataOnPath = attributeValue ? getTemplateTokenValue(attributeValue) : undefined;
                    const value = dataOnPath ? get(values, dataOnPath) : undefined;
                    const callback = value && typeof value == "function" ? value.bind(values.this) : undefined;
                    if (callback && eventName) {
                        childElement.listeners.push({
                            eventName,
                            callback
                        });
                    } else {
                        log(LOG_LEVEL.error, "invalid value for %s [%s]=[%o][%o] for [%o]", attribute, attributeValue, values, value, node);
                        throw new Error(`invalid value for ${attribute}`);
                    }
                } else {
                    childElement.attributes.push({
                        attribute,
                        value: evaluateTextTemplateForAttribute(attributeValue, values)
                    });
                }
            } else {
                childElement.attributes.push({
                    attribute,
                    value: ""
                });
            }
        }
    }
}
function dataRef(node, values, childElement) {
    const dataRefValue = node.getAttribute(DATA_REF);
    if (dataRefValue !== null) {
        const dataRefPath = getTemplateTokenValue(dataRefValue);
        const value = dataRefPath ? get(values, dataRefPath) : undefined;
        const callback = value && typeof value == "function" ? value.bind(values.this) : undefined;
        if (callback) {
            childElement.refListeners.push({
                listener: callback
            });
        } else {
            log(LOG_LEVEL.error, "invalid value for %s [%s]=[%o] for [%o]", DATA_REF, dataRefValue, value, values.this);
            throw new Error(`invalid value for ${DATA_REF}`);
        }
    }
}
function parseTemplateXML(renderOutput, values, xml) {
    if (typeof renderOutput === "string") {
        log(LOG_LEVEL.trace, xml ? "using cache" : "not using cache");
        const xmlDocument = xml ? xml : parseXML(renderOutput);
        const root = xmlDocument.children[0];
        return parseChildNodes(root.childNodes, values);
    }
}
class VDOMComment extends VDOMNode {
    constructor(textContent){
        super("Comment");
        this.textContent = textContent;
    }
    create(parent) {
        if (this.ref) {
            throw new Error("already created!");
        }
        this.parent = parent;
        const ref = document.createComment("");
        this.update(ref);
        return ref;
    }
    update(ref) {
        super.update(ref);
        if (ref.textContent !== this.textContent) {
            ref.textContent = this.textContent;
            return true;
        }
        return false;
    }
}
async function renderCommentNode(node, values) {
    const path = getTemplateTokenValue(node.textContent);
    if (!path) {
        return node.textContent ? [
            new VDOMComment(node.textContent)
        ] : [];
    } else {
        const templateLocation = getTemplateFromLocation(path);
        if (!(templateLocation instanceof Promise)) {
            const ret = parseTemplateXML(templateLocation.template, values, templateLocation.xmlDocument);
            return ret ? ret : [];
        } else {
            const templateCache = await templateLocation;
            const ret1 = parseTemplateXML(templateCache.template, values, templateCache.xmlDocument);
            return ret1 ? ret1 : [];
        }
    }
}
class VDOMElement extends VDOMNode {
    constructor(tagName){
        super("Element");
        this.tagName = tagName;
        this.children = [];
        this.attributes = [];
        this.listeners = [];
        this.refListeners = [];
    }
    create(parent) {
        if (this.ref) {
            throw new Error("already created!");
        }
        this.parent = parent;
        const ref = document.createElement(this.tagName);
        this.update(ref, true);
        for (const refListener of this.refListeners){
            refListener.listener(ref);
        }
        if (this.children) {
            for (const child of this.children){
                try {
                    const element = child.create(ref);
                    ref.appendChild(element);
                } catch (e) {
                    throw e;
                }
            }
        }
        return ref;
    }
    update(ref, first = false) {
        super.update(ref);
        let ret = false;
        for (const attribute of this.attributes){
            if (ref.getAttribute(attribute.attribute) !== attribute.value) {
                ret = true;
                ref.setAttribute(attribute.attribute, attribute.value);
            }
        }
        for (const listener of this.listeners){
            ref.addEventListener(listener.eventName, listener.callback);
        }
        return ret;
    }
    disconnect(ref) {
        for (const listener of this.listeners){
            ref.removeEventListener(listener.eventName, listener.callback);
        }
        super.disconnect(ref);
    }
    compare(other) {
        return super.compare(other) && other.tagName === this.tagName;
    }
    toString() {
        return `${this.type} TemplateNode ${this.tagName}`;
    }
}
async function parseChildNodes(childNodes, values) {
    let ret = [];
    for(let i = 0; i < childNodes.length; i++){
        const node = childNodes[i];
        if (!node) {
            continue;
        }
        if (node.nodeType === Node.COMMENT_NODE && node.textContent !== null) {
            ret = ret.concat(await renderCommentNode(node, values));
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent !== null) {
            ret = ret.concat(renderTextNode(node, values));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            ret = ret.concat(await renderElementNode(node, values));
        }
    }
    return ret;
}
async function renderElementNode(node, values) {
    return dataForEach(node, values, async (node, values)=>{
        if (dataIf(node, values) && dataIfn(node, values)) {
            const tagName = node.tagName;
            const childElement = new VDOMElement(tagName);
            dataRef(node, values, childElement);
            dataOnAndOtherAttributes(node, values, childElement);
            childElement.children = await parseChildNodes(node.childNodes, values);
            return childElement;
        }
    });
}
function cancelRender(element) {
    const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, element);
    if (oldRefreshTimeout && oldRefreshTimeout.timeout) {
        clearTimeout(oldRefreshTimeout.timeout);
        oldRefreshTimeout.abortController.abort();
        oldRefreshTimeout.timeout = null;
        const elementToRenderOn = element instanceof ShadowRoot && element.host ? element.host : element;
        log(LOG_LEVEL.debug, "canceling render on %o", elementToRenderOn);
    }
}
function disconnect(component) {
    cancelRender(component);
    const oldTemplate = weakMapGet.call(lastTemplateMap, component);
    if (oldTemplate) {
        disconnectAll(oldTemplate.output);
    }
}
function hasCache(component) {
    return weakMapHas.call(lastTemplateMap, component);
}
async function render(abortController, element, renderFunction) {
    log(LOG_LEVEL.trace, "render %o", element);
    if (abortController.signal.aborted) {
        log(LOG_LEVEL.trace, "render aborted %o", element);
        return;
    }
    const renderOutput = await renderFunction({
        abortController
    });
    if (abortController.signal.aborted) {
        log(LOG_LEVEL.trace, "render aborted %o", element);
        return;
    }
    const out = typeof renderOutput === "string" ? {
        template: renderOutput ? renderOutput : "",
        values: {}
    } : {
        template: renderOutput && renderOutput.template ? renderOutput.template : "",
        values: renderOutput && renderOutput.values ? renderOutput.values : {}
    };
    if (out && out.template !== undefined) {
        const { output , xmlDocument  } = await renderTemplateOnElement(element, out.template, out.values);
        if (abortController.signal.aborted) {
            log(LOG_LEVEL.trace, "render aborted %o", element);
            return;
        }
        return {
            apply: ()=>{
                if (abortController.signal.aborted) {
                    log(LOG_LEVEL.trace, "render aborted %o", element);
                    return false;
                }
                return applyRender(abortController, element, out.template, xmlDocument, output);
            }
        };
    }
}
async function renderTemplateOnElement(element, template, values) {
    const oldTemplate = weakMapGet.call(lastTemplateMap, element);
    const xmlDocument = oldTemplate && oldTemplate.template === template ? oldTemplate.xmlDocument : parseXML(template);
    const output = await parseTemplateXML(template, values, xmlDocument);
    return {
        output,
        xmlDocument
    };
}
function applyRender(abortController, element, template, xmlDocument, output) {
    if (abortController.signal.aborted) {
        log(LOG_LEVEL.trace, "render aborted %o", element);
        return false;
    }
    const oldTemplate = weakMapGet.call(lastTemplateMap, element);
    if (output) {
        const ret = renderVDOMDiffOn(element, output, oldTemplate?.output);
        weakMapSet.call(lastTemplateMap, element, {
            output,
            template,
            xmlDocument
        });
        if (oldTemplate) {
            disconnectAll(oldTemplate.output);
        }
        return ret;
    }
    return false;
}
const lastTemplateMap = new WeakMap();
function disconnectAll(nodes) {
    for (const n of nodes){
        const children = n.children;
        n.disconnect(n.ref);
        if (children) {
            disconnectAll(children);
        }
    }
}
function addRenderListener(component, listener) {
    const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, component);
    if (oldRefreshTimeout) {
        oldRefreshTimeout.eventTarget.addEventListener("render", listener);
    }
}
function queueRender(element, renderFunction, listener, callback) {
    cancelRender(element);
    const startMS = Date.now();
    const elementToRenderOn = element instanceof ShadowRoot && element.host ? element.host : element;
    const renderMode = !hasCache(element) ? "create" : "update";
    log(LOG_LEVEL.trace, `queue render %s %o`, renderMode, elementToRenderOn);
    const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, element);
    const abortController = new AbortController();
    const eventTarget = oldRefreshTimeout ? oldRefreshTimeout.eventTarget : new EventTarget();
    const timeout = setTimeout(async function queueRenderTrigger() {
        const renderTimeout = setTimeout(function queueRenderTriggerTimeout() {
            log(LOG_LEVEL.warn, `render %s %o max timeout %s`, renderMode, elementToRenderOn, 60000);
            abortController.abort();
        }, 60000);
        try {
            log(LOG_LEVEL.trace, `render %s %o`, renderMode, elementToRenderOn);
            if (abortController.signal.aborted) {
                return;
            }
            const renderAction = await render(abortController, element, renderFunction);
            if (abortController.signal.aborted) {
                return;
            }
            if (renderAction) {
                const changesRendered = renderAction.apply();
                if (changesRendered) {
                    const tookMS = Date.now() - startMS;
                    if (tookMS > 50) {
                        log(LOG_LEVEL.warn, `render %s %o took %sms!`, renderMode, elementToRenderOn, tookMS);
                    } else {
                        log(LOG_LEVEL.debug, `render %s %o took %sms`, renderMode, elementToRenderOn, tookMS);
                    }
                }
            }
            eventTarget.dispatchEvent(new CustomEvent("render", {
                detail: abortController.signal
            }));
            try {
                if (callback) {
                    callback();
                }
            } catch (e) {
                log(LOG_LEVEL.error, e);
            }
        } catch (e1) {
            log(LOG_LEVEL.error, "error rendering %o %o", elementToRenderOn, e1);
        } finally{
            clearTimeout(renderTimeout);
            const refreshTimeout = weakMapGet.call(refreshTimeouts, element);
            if (refreshTimeout) {
                weakMapDelete.call(refreshTimeouts, element);
            }
        }
    }, 0);
    weakMapSet.call(refreshTimeouts, element, {
        eventTarget,
        abortController,
        timeout
    });
    if (listener) {
        addRenderListener(element, listener);
    }
}
const refreshTimeouts = new WeakMap();
function getAttribute(element, name, defaultValue) {
    const value = element.getAttribute(name);
    const currentValue = value === null ? defaultValue : value;
    return currentValue;
}
function useAttribute(element, context, meta, renderArgs, name, defaultValue, watch = true) {
    const currentValue = getAttribute(element, name, defaultValue);
    log(LOG_LEVEL.trace, "useAttribute %o with value = %o", element, currentValue);
    if (watch) {
        if (meta.attributeWatch.indexOf(name) === -1) {
            meta.attributeWatch.push(name);
            context.lastValue = currentValue;
            context.checkChanged = function() {
                return {
                    shouldAbort: context.lastValue !== getAttribute(element, name, defaultValue),
                    shouldRefresh: true
                };
            };
        }
    }
    return currentValue;
}
function useJSONAttribute(element, context, meta, renderArgs, name, defaultValue) {
    const value = useAttribute(element, context, meta, renderArgs, name, defaultValue);
    log(LOG_LEVEL.trace, "useJSONAttribute %o with value = %o", element, value);
    return typeof value === "string" && value !== "" ? JSON.parse(value) : value;
}
function attributeEffect(element, meta) {
    return function() {
        mutationObserverObserve.call(meta.observer, element, {
            attributes: true,
            attributeFilter: meta.attributeWatch
        });
        return ()=>{
            mutationObserverDisconnect.call(meta.observer);
        };
    };
}
function useEffect(element, context, meta, renderArgs, effect) {
    meta.effects.push(effect);
}
function useMountEffect(element, context, meta, renderArgs, effect) {
    if (context.firstRun) {
        meta.mountEffects.push(effect);
    }
}
function flushEffects(effects, callbacks) {
    const splice = effects.splice(0, effects.length);
    for (const effect of splice){
        try {
            const disconnect = effect();
            if (disconnect) {
                callbacks.push(disconnect);
            }
        } catch (e) {
            log(LOG_LEVEL.error, e);
        }
    }
}
function flushEffectCallbacks(callbacks) {
    const splice = callbacks.splice(0, callbacks.length);
    for (const cb of splice){
        try {
            cb();
        } catch (e) {
            log(LOG_LEVEL.error, e);
        }
    }
}
function useQuery(element, context, meta, renderArgs, name, defaultValue) {
    const value = getQueryValue(name, defaultValue);
    if (meta.queryWatch.indexOf(name) === -1) {
        meta.queryWatch.push(name);
        context.lastValue = value;
        context.checkChanged = function() {
            return {
                shouldAbort: context.lastValue !== getQueryValue(name, defaultValue),
                shouldRefresh: true
            };
        };
    }
    return [
        value,
        (newValue)=>{
            setQueryValue(name, newValue);
        }
    ];
}
function queryEffect(meta) {
    return function() {
        const queryCalls = meta.contextCalls.filter((c)=>c.call === "useQuery");
        function listener() {
            let changed = false;
            for (const call of queryCalls){
                if (call.checkChanged && call.checkChanged()) {
                    changed = true;
                    break;
                }
            }
            if (changed) {
                meta.refresh();
            }
        }
        windowAddEventListener("popstate", listener);
        return function() {
            windowRemoveEventListener("popstate", listener);
        };
    };
}
function useState(element, context, meta, renderArgs, defaultValue) {
    const key = context.name;
    function getValue() {
        return meta.state[key] !== undefined ? meta.state[key] : defaultValue;
    }
    function setValue(newValue) {
        if (meta.state[key] !== newValue) {
            renderArgs.abortController.abort();
            meta.state[key] = newValue;
            setTimeout(function() {
                meta.refresh();
            }, 0);
        }
    }
    const value = getValue();
    meta.state[key] = value;
    context.lastValue = value;
    context.checkChanged = function() {
        return {
            shouldAbort: context.lastValue !== getValue(),
            shouldRefresh: false
        };
    };
    return [
        value,
        setValue,
        getValue
    ];
}
function useSubscription(element, context, meta, renderArgs, store, selector) {
    function listener(newValue) {
        log(LOG_LEVEL.trace, `useSubscription.listener for %s for %s`, context.name, element);
        renderArgs.abortController.abort();
        setTimeout(function() {
            meta.refresh();
        });
    }
    const value = store.subscribe(selector, listener);
    this.useEffect(()=>{
        return ()=>{
            store.unSubscribe(listener);
        };
    });
    context.lastValue = value;
    context.checkChanged = function() {
        const currentValue = selector(store.getState());
        log(LOG_LEVEL.trace, `useSubscription check for %s for [%s] !== [%s]`, context.name, context.lastValue, currentValue);
        log(LOG_LEVEL.trace, `useSubscription check for %s for %s`, context.name, element);
        return {
            shouldAbort: !deepEquals(context.lastValue, currentValue),
            shouldRefresh: false
        };
    };
    return value;
}
function useAs(element, context, meta, renderArgs, name, value) {
    context.name = name;
    set(meta.templateValues, name, value);
}
function createFunctionContext(element, meta, firstRun, renderArgs) {
    let lock = false;
    const usage = [];
    const FunctionContextSelf = {
        element,
        shadowRoot: meta.shadowRoot
    };
    function bindContextUseFunction(name, useFunc) {
        const useFuncBound = useFunc.bind(FunctionContextSelf);
        if (FunctionContextSelf[name]) {
            throw new Error("already bound");
        }
        FunctionContextSelf[name] = function(...args) {
            if (lock) {
                throw new Error(`cannot use ${name} after render!`);
            }
            if (renderArgs.abortController.signal.aborted) {
                throw new Error(`cannot use ${name} after render aborted!`);
            }
            const usageArg = {
                call: name,
                name: `func-${name}-${usage.length}`,
                firstRun
            };
            usage.push(usageArg);
            return useFuncBound(element, usageArg, meta, renderArgs, ...args);
        };
    }
    bindContextUseFunction("useState", useState);
    bindContextUseFunction("useEffect", useEffect);
    bindContextUseFunction("useMountEffect", useMountEffect);
    bindContextUseFunction("useAs", useAs);
    bindContextUseFunction("useAttribute", useAttribute);
    bindContextUseFunction("useJSONAttribute", useJSONAttribute);
    bindContextUseFunction("useQuery", useQuery);
    bindContextUseFunction("useSubscription", useSubscription);
    return {
        validateAndLock: function validateAndLock() {
            if (lock) {
                throw new Error("cannot use validateAndLock when locked!");
            }
            lock = true;
            const usageSplice = usage.splice(0, usage.length);
            if (firstRun) {
                meta.contextCalls = usageSplice;
            } else if (usageSplice.length !== meta.contextCalls.length) {
                meta.lock = true;
                throw new Error(`conditional this.use calls detected(1)! ${usageSplice.map((u)=>u.name).join(",")} vs ${meta.contextCalls.map((u)=>u.name).join(",")}`);
            } else if (usageSplice.filter((v, i)=>meta.contextCalls[i].call !== v.call || meta.contextCalls[i].name !== v.name).length > 0) {
                meta.lock = true;
                throw new Error("conditional this.use calls detected(2)!");
            } else {
                meta.contextCalls = usageSplice;
            }
        },
        this: FunctionContextSelf
    };
}
function renderFunction(element, firstRun, meta) {
    return queueRender(meta.shadowRoot ? meta.shadowRoot : element, createRenderFunction(element, firstRun, meta), firstRun ? function() {
        flushEffects(meta.mountEffects, meta.mountEffectCallbacks);
    } : undefined, meta.renderCallback);
}
function createRenderFunction(element, firstRun, meta) {
    return async function(args) {
        if (args.abortController.signal.aborted) {
            return;
        }
        meta.templateChildren = meta.templateChildren ? meta.templateChildren : nodeList2Array(element.childNodes);
        const defaultValues = {
            children: meta.templateChildren
        };
        const context = createFunctionContext(element, meta, firstRun, args);
        const output = await meta.func.bind({
            ...context.this
        })(args);
        context.validateAndLock();
        if (args.abortController.signal.aborted) {
            return;
        }
        checkContextCallsForChangesAndAbort(element, meta, args);
        if (args.abortController.signal.aborted) {
            return;
        }
        const values = {
            ...defaultValues,
            ...meta.templateValues,
            ...output && typeof output !== "string" && output.values ? output.values : {}
        };
        meta.templateValues = {};
        return output ? typeof output === "string" ? {
            template: output,
            values
        } : {
            template: output.template,
            values
        } : meta.template ? {
            template: meta.template,
            values
        } : undefined;
    };
}
function checkContextCallsForChangesAndAbort(element, meta, args) {
    let shouldAbort = false;
    let shouldRefresh = true;
    for (const call of meta.contextCalls){
        if (call.checkChanged) {
            const changes = call.checkChanged();
            shouldAbort = shouldAbort ? shouldAbort : changes.shouldAbort;
            if (shouldAbort && shouldRefresh && changes.shouldAbort && !changes.shouldRefresh) {
                shouldRefresh = false;
                log(LOG_LEVEL.debug, `render aborted before apply for %o shouldRefresh %s because %s`, element, shouldRefresh, call.name);
                break;
            }
        }
    }
    if (shouldAbort) {
        log(LOG_LEVEL.debug, `render aborted before apply for %o shouldRefresh %s`, element, shouldRefresh);
        args.abortController.abort();
        if (shouldRefresh) {
            setTimeout(function() {
                meta.refresh();
            }, 0);
        }
    }
}
function constructorCallback(element, func, shadowInit, template) {
    if (weakMapHas.call(metaMap, element)) {
        throw new Error("createHookContext called twice on element");
    }
    const meta = {
        lock: false,
        shadowRoot: shadowInit || shadowInit === undefined ? element.attachShadow(shadowInit && typeof shadowInit === "object" ? shadowInit : {
            mode: "closed"
        }) : undefined,
        func,
        template,
        state: {},
        mountEffects: [],
        mountEffectCallbacks: [],
        effects: [],
        effectCallbacks: [],
        queryWatch: [],
        attributeWatch: [],
        contextCalls: [],
        templateValues: {},
        observer: new MutationObserver(function() {
            meta.refresh();
        }),
        refresh: (firstRun = false)=>{
            if (meta.lock) {
                throw new Error("conditional this.use calls detected. function component locked!");
            }
            flushEffectCallbacks(meta.effectCallbacks);
            meta.attributeWatch.splice(0, meta.attributeWatch.length);
            meta.queryWatch.splice(0, meta.queryWatch.length);
            return renderFunction(element, firstRun, meta);
        },
        renderCallback: ()=>{
            if (meta.queryWatch.length > 0) {
                meta.effects.unshift(queryEffect(meta));
            }
            if (meta.attributeWatch.length > 0) {
                meta.effects.unshift(attributeEffect(element, meta));
            }
            flushEffects(meta.effects, meta.effectCallbacks);
        }
    };
    weakMapSet.call(metaMap, element, meta);
}
function connectedCallback(element) {
    const meta = getMeta(element);
    return meta.refresh(true);
}
function disconnectedCallback(element) {
    const meta = getMeta(element);
    flushEffectCallbacks(meta.effectCallbacks);
    flushEffectCallbacks(meta.mountEffectCallbacks);
    return disconnect(meta.shadowRoot ? meta.shadowRoot : element);
}
const metaMap = new WeakMap();
function getMeta(element) {
    const meta = weakMapGet.call(metaMap, element);
    if (!meta) {
        throw new Error("getMeta no meta for element");
    }
    return meta;
}
const DEFAULT_OPTIONS = {
    shadowInit: {
        mode: "closed"
    },
    template: ""
};
function define(tag, func, options) {
    if (typeof func !== "function" && options !== undefined) {
        throw new Error("bad arguments options cannot be passed if func is RenderFunctionWithOptions");
    }
    const f = typeof func === "function" ? func : func.render;
    const o = typeof func === "function" ? options ? {
        ...DEFAULT_OPTIONS,
        ...options
    } : DEFAULT_OPTIONS : func;
    customElements.define(tag, class extends HTMLElement {
        constructor(){
            super();
            constructorCallback(this, f, o.shadowInit, o.template);
        }
        connectedCallback() {
            return connectedCallback(this);
        }
        disconnectedCallback() {
            return disconnectedCallback(this);
        }
    });
}
function __default() {
    this.useAs("text", "helloWorld");
}
define("my-component", __default, {
    "template": "<p>{text}</p><p>label</p><div><p>\"{text}\\\"</p>\n<p>label</p></div>"
});
