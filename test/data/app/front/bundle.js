(()=>{var e={270:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0})},804:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ParseOptionsError=void 0;class r extends Error{constructor(e="BAD REQUEST",t){super(e),this.argAttr=t,this.name="ParseOptionsError"}}t.ParseOptionsError=r},183:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.get=void 0;const n=r(571);t.get=(e,t,r,s,o)=>{if("string"==typeof s&&(s={type:s}),r&&s&&s.defaultValue)throw new Error("cannot send defaultValue and options.defaultValue");if(r=r||(s?s.defaultValue:void 0),!e||"object"!=typeof e)return void 0!==r?r:void 0;if("string"!=typeof t)throw new Error("attrPath must be typeof string");const i=t.split(".").reverse();let a=e;for(;i.length>0;){const e=i.pop();if(void 0===a[e])return void 0!==r?r:void 0;a=a[e]}return s?(o||{parse:n.parse}).parse({value:a},{value:s},"no_extra",t).value:a}},166:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.NativeURL=t.newURL=void 0,t.newURL=(e,t)=>new URL(e,t),t.NativeURL=URL},708:function(e,t,r){"use strict";var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),s=this&&this.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||n(t,e,r)};Object.defineProperty(t,"__esModule",{value:!0}),s(r(571),t),s(r(270),t),s(r(804),t),s(r(183),t)},571:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parse=t.Parser=void 0;const n=r(804),s=r(484),o=["|","!","?"],i={type:"string",regex:"string?",multipleOptions:"ParseOptionsBase[]!?",forceArray:"boolean?",allowNull:"boolean?",arrayType:"string?",arrayMinLength:"number?",arrayMaxLength:"number?",numberMaxDecimals:"number?",numberMinDecimals:"number?",numberMin:"number?",numberMax:"number?",stringMaxLength:"number?",stringMinLength:"number?",nestedOptions:{type:"nested?",nestedOptions:{options:{options:"ParseOption[]!|ParseOptionMap",mode:"ParseOptionsMode?"},mode:"no_extra"}},enumValues:"string[]?",parseJSON:"boolean?",description:"string?",required:"boolean?",defaultValue:"any?"},a=(e,t,r)=>{const{type:s,forceArray:o,parseJSON:i,defaultValue:a,required:u,name:c,value:d,attrName:p,allowNull:l}=e,h=t[s];if(void 0===h)throw new n.ParseOptionsError(`unsupported type ${s}`);if(void 0===d&&(!0===u||void 0===u))throw new n.ParseOptionsError(`${c}.${p} not defined`,`${c}.${p}`);if(void 0!==d||void 0!==a){if(void 0===d&&void 0!==a)return a;if(i){if("string"!=typeof e.value)throw new n.ParseOptionsError("parseJSON not available to non string value");try{e.value=JSON.parse(e.value)}catch(e){throw new n.ParseOptionsError("value not json!")}}return l&&null===e.value?null:(!o||e.value instanceof Array||(e.value=[e.value]),h(e,r))}};class u{constructor(){this.parsers={},this.registerParser("any",s.parseAny),this.registerParser("array",s.parseArray),this.registerParser("dict",s.parseDict),this.registerParser("boolean",s.parseBoolean),this.registerParser("enum",s.parseEnum),this.registerParser("multiple",s.parseMultiple),this.registerParser("nested",s.parseNested),this.registerParser("number",s.parseNumber),this.registerParser("object",s.parseObject),this.registerParser("string",s.parseString),this.registerParser("regex",s.parseRegex),this.registerParser("url",s.parseURL),this.registerParser("function",s.parseFunction),this.registerParser("email",s.parseEmail),this.registerParser("encodeHtml",s.parseEncodeHTML),this.registerParser("decodeHtml",s.parseDecodeHTML),this.registerEnum("ParseOptionsMode",["remove_extra","add_extra","no_extra"]),this.registerType("ParseOption",{...i,name:"string"}),this.registerType("ParseOptionsBase",i),this.registerDict("ParseOptionMap","ParseOptionsBase|string"),this.registerType("ParseOptions",{description:"string?",options:"ParseOptionMap|ParseOption[]",mode:"ParseOptionsMode?"}),this.registerType("ParserInterface",{parse:"function"},"add_extra"),this.registerType("GroupPolicy",{group:"string[]",groupPolicy:{type:"enum",enumValues:["at_least_one","all"]}}),this.registerType("SessionHandlerOptions",{tokenLocation:{type:"enum",enumValues:["header","query","cookie"]},tokenLocationName:"string|function",setCookieOptions:{type:"nested?",nestedOptions:{options:{httpOnly:"boolean",secure:"boolean",path:"string|function",sameSite:{type:"enum",enumValues:["lax","strict","none"]}},mode:"no_extra"}}})}registerDict(e,t,r=!1){return this.registerParser(e,((e,r)=>a({...e,dictType:t,type:"dict"},this.parsers,this)),r)}registerEnum(e,t,r=!1){return this.registerParser(e,((e,r)=>a({...e,enumValues:t,type:"enum"},this.parsers,this)),r)}registerType(e,t,r="no_extra",n=!1){return this.registerParser(e,((e,n)=>a({...e,nestedOptions:{options:t,mode:r},type:"nested"},this.parsers,this)),n)}registerParser(e,t,r=!1){if("string"!=typeof e)throw new Error("type must be a string");if("function"!=typeof t)throw new Error("options must be a function");for(const t of o)if(-1!==e.indexOf(t))throw new Error(`cannot use type name with ${o.join(",")} in the type name`);if(this.parsers[e])throw new Error("already registered!");this.parsers[e]=t,r||(this.parsers[`${e}[]`]=(t,r)=>a({...t,type:"array",arrayType:e},this.parsers,this),this.parsers[`${e}[]!`]=(t,r)=>a({...t,type:"array",arrayType:e,forceArray:!0},this.parsers,this))}parse(e,t,r="no_extra",s="arg"){const o={},i="string"==typeof t;let u=s;if(null==e||"object"!=typeof e&&!i)throw new n.ParseOptionsError(`invalid ${s}`,s);if(i&&"no_extra"!==r)throw new n.ParseOptionsError("cannot use options as string and send mode");i&&(t={[s]:t},e={[s]:e},s=""),t instanceof Array||(t=(e=>{if("object"!=typeof e)throw new Error("options not object");return Object.keys(e).map((t=>{const r=e[t];return"object"!=typeof r?{name:t,required:!0,type:r}:void 0===r.required?{...r,required:!0,name:t}:{...r,name:t}}))})(t));for(const r of t){if("string"!=typeof r.type)throw new n.ParseOptionsError(`invalid type ${r.type}`,s);const t=e[r.name];if(void 0===t&&void 0!==r.defaultValue){o[r.name]=r.defaultValue;continue}const i=r.type.split("|").map((e=>e.trim())).filter((e=>e));for(let e=0;e<i.length;e++){const u={...r,type:i[e]};if("?"===u.type.charAt(u.type.length-1)&&(u.required=!1,u.type=u.type.substring(0,u.type.length-1)),void 0!==t||!1!==u.required||void 0!==u.defaultValue)try{const r=a({name:s,attrName:u.name,type:u.type,regex:u.regex,required:u.required,defaultValue:u.defaultValue,value:t,dictType:u.dictType,numberMaxDecimals:u.numberMaxDecimals,numberMinDecimals:u.numberMinDecimals,numberMin:u.numberMin,numberMax:u.numberMax,allowNull:u.allowNull,multipleOptions:u.multipleOptions,stringMinLength:u.stringMinLength,stringMaxLength:u.stringMaxLength,arrayType:u.arrayType,nestedOptions:u.nestedOptions,enumValues:u.enumValues,parseJSON:u.parseJSON,arrayMaxLength:u.arrayMaxLength,arrayMinLength:u.arrayMinLength,forceArray:u.forceArray},this.parsers,this);if(void 0===r&&i.length-1===e)throw new n.ParseOptionsError(`${s?`${s}.`:""}${u.name} not ${u.type}${"number"===u.type&&void 0!==u.numberMin?`${u.numberMin}:`:""}${"number"===u.type&&void 0!==u.numberMax?`:${u.numberMax}`:""}${void 0!==u.numberMinDecimals?` min decimals[${u.numberMinDecimals}]`:""}${void 0!==u.numberMaxDecimals?` max decimals[${u.numberMaxDecimals}]`:""}${"string"===u.type&&void 0!==u.stringMinLength?`${u.stringMinLength}:`:""}${"string"===u.type&&void 0!==u.stringMaxLength?`:${u.stringMaxLength}`:""}${"array"===u.type&&void 0!==u.arrayMinLength?`${u.arrayMinLength}:`:""}${"array"===u.type&&void 0!==u.arrayMaxLength?`:${u.arrayMaxLength}`:""}`+("array"===u.type&&u.arrayType?"enum"!==u.arrayType?` of ${u.arrayType}`:` of ${u.arrayType} as defined. valid values [${u.enumValues}]`:"")+("nested"===u.type?" as defined!":"")+("enum"===u.type?` as defined. valid values [${u.enumValues}]`:"")+("multiple"===u.type?" as defined.":""),`${s}.${u.name}`);if(void 0!==r){o[u.name]=r;break}}catch(t){if(i.length-1===e)throw t}}}if(i)return o[u];switch(r){case"no_extra":const t=Object.keys(e);for(const r of t)if(!o.hasOwnProperty(r)&&void 0!==e[r])throw new n.ParseOptionsError(`${s}.${r} option not valid [${r}]`,`${s}.${r}`);return o;case"add_extra":return{...e,...o};case"remove_extra":return o;default:throw new n.ParseOptionsError(`unsupported mode ${r}`)}}}t.Parser=u;const c=new u;t.parse=(e,t,r="no_extra",n="arg")=>c.parse(e,t,r,n)},387:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseAny=void 0,t.parseAny=e=>e.value},14:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseArray=void 0,t.parseArray=function(e,t){const{value:r,arrayType:n,name:s,attrName:o,numberMin:i,numberMax:a,allowNull:u,multipleOptions:c,stringMinLength:d,numberMaxDecimals:p,numberMinDecimals:l,stringMaxLength:h,nestedOptions:f,enumValues:m,regex:v,arrayMaxLength:y,arrayMinLength:g}=e;let b=[];if(r instanceof Array&&!(void 0!==y&&r.length>y||void 0!==g&&r.length<g)){if(void 0===n)b=b.concat(r);else for(let e=0;e<r.length;e++){const O=r[e],M=t.parse({[e.toString()]:O},{[e.toString()]:{type:n,regex:v,forceArray:!1,numberMin:i,numberMax:a,numberMaxDecimals:p,numberMinDecimals:l,allowNull:u,multipleOptions:c,stringMinLength:d,stringMaxLength:h,nestedOptions:f,enumValues:m,arrayMaxLength:y,arrayMinLength:g}},"no_extra",`${s}.${o}`);if(void 0===M[e])return;b.push(M[e])}return b}}},900:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseBoolean=void 0,t.parseBoolean=function(e){return"true"===e.value||!0===e.value||"false"!==e.value&&!1!==e.value&&void 0}},215:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseDict=void 0,t.parseDict=function(e,t){if("object"==typeof e.value){if(void 0!==e.dictType){const r=Object.keys(e.value),n={};for(const s of r)n[s]=t.parse({[e.attrName]:{[s]:e.value[s]}},{[e.attrName]:{type:"nested",nestedOptions:{options:{[s]:e.dictType},mode:"no_extra"}}},"no_extra",e.name)[e.attrName][s];return n}return e.value}}},264:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseEmail=void 0;const r=/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;t.parseEmail=function(e){if("string"==typeof e.value&&!(void 0!==e.stringMinLength&&e.value.length<e.stringMinLength)&&!(void 0!==e.stringMaxLength&&e.value.length>e.stringMaxLength)&&r.test(String(e.value).toLowerCase()))return e.value}},566:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseEnum=void 0;const n=r(804),s=r(14);t.parseEnum=function(e,t){const r=(0,s.parseArray)({name:`${e.name}.${e.attrName}`,attrName:"enumList",forceArray:!1,type:"array",value:e.enumValues,arrayType:"string"},t);if(void 0===r)throw new n.ParseOptionsError("options.enumValues not a string array");if(-1!==r.indexOf(e.value))return e.value}},907:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseFunction=void 0,t.parseFunction=function(e){return"function"==typeof e.value?e.value:void 0}},867:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseDecodeHTML=t.parseEncodeHTML=void 0;const n=r(559);t.parseEncodeHTML=function(e){const t=(0,n.parseString)(e);return void 0===t?void 0:function(e){const t=[];for(let r=e.length-1;r>=0;r--)t.unshift(["&#",e[r].charCodeAt(0),";"].join(""));return t.join("")}(t)},t.parseDecodeHTML=function(e){const t=(0,n.parseString)(e);return void 0===t?void 0:function(e){return e.replace(/&#(\d+);/g,(function(e,t){return String.fromCharCode(t)}))}(t)}},484:function(e,t,r){"use strict";var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),s=this&&this.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||n(t,e,r)};Object.defineProperty(t,"__esModule",{value:!0}),s(r(387),t),s(r(14),t),s(r(900),t),s(r(264),t),s(r(566),t),s(r(360),t),s(r(106),t),s(r(911),t),s(r(907),t),s(r(140),t),s(r(852),t),s(r(215),t),s(r(559),t),s(r(147),t),s(r(867),t)},360:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseMultiple=void 0;const n=r(804);t.parseMultiple=function(e,t){if(!e.multipleOptions)throw new n.ParseOptionsError(`unsupported type ${e.type} without multipleOptions`);for(let r=0;r<e.multipleOptions.length;r++){const n=e.multipleOptions[r];try{const r=t.parse({[e.attrName]:e.value},{[e.attrName]:{...n,forceArray:e.forceArray}},"no_extra",e.name)[e.attrName];if(void 0!==r)return r}catch(e){}}}},106:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseNested=void 0;const n=r(804);t.parseNested=function(e,t){if(!e.nestedOptions)throw new n.ParseOptionsError(`unsupported type ${e.type} without nestedOptions`);return t.parse(e.value,e.nestedOptions.options,e.nestedOptions.mode,`${e.name}.${e.attrName}`)}},911:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseNumber=void 0,t.parseNumber=function(e){if(null===e.value||isNaN(e.value))return;const t=parseFloat(e.value);if(!(void 0!==e.numberMin&&t<e.numberMin||void 0!==e.numberMax&&t>e.numberMax)){if(void 0!==e.numberMaxDecimals||void 0!==e.numberMinDecimals){const r=String(t).split(".")[1],n=void 0!==r?r.length:0;if(void 0!==e.numberMinDecimals&&n<e.numberMinDecimals)return;if(void 0!==e.numberMaxDecimals&&n>e.numberMaxDecimals)return}return t}}},140:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseObject=void 0,t.parseObject=function(e){return"object"==typeof e.value?e.value:void 0}},852:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseRegex=void 0;const n=r(804);t.parseRegex=function(e){if(void 0===e.regex||"string"!=typeof e.regex)throw new n.ParseOptionsError(`unsupported type ${e.type} without regex as string`);return new RegExp(e.regex).test(e.value)?e.value:void 0}},559:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseString=void 0,t.parseString=function(e){if("string"==typeof e.value&&!(void 0!==e.stringMinLength&&e.value.length<e.stringMinLength||void 0!==e.stringMaxLength&&e.value.length>e.stringMaxLength))return e.value}},147:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseURL=void 0;const n=r(166);t.parseURL=function(e){const t=e.value instanceof n.NativeURL;if(!t&&"string"!=typeof e.value)return;const r=t?e.value.toString():e.value;if(!(void 0!==e.stringMinLength&&r.length<e.stringMinLength||void 0!==e.stringMaxLength&&r.length>e.stringMaxLength))try{return t?e.value:(0,n.newURL)(e.value)}catch(e){return}}},18:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ResponseError=t.parseRedirectLocation=t.readResponseBuffer=t.TEXT_TYPE=t.JSON_TYPE=t.CONTENT_TYPE_HEADER=t.DEFAULT_USER_AGENT=void 0;const n=r(137);t.DEFAULT_USER_AGENT="curl/7.69.1",t.CONTENT_TYPE_HEADER="Content-Type",t.JSON_TYPE="application/json;charset=utf-8",t.TEXT_TYPE="plain/text;charset=utf-8";const s=(e,t)=>{const r=(0,n.newURLSearchParams)(e.toString());if(!t)return r;const s=Object.keys(t);for(const e of s)if(t[e]instanceof Array)for(const n of t[e])r.has(e)?r.append(e,String(n)):r.set(e,String(n));else r.has(e)?r.append(e,String(t[e])):r.set(e,String(t[e]));return r};t.readResponseBuffer=({res:e,readTimeout:t,options:r,req:n,reject:s,logger:o},i)=>{try{const a=[];t&&clearTimeout(t);const u=r.timeout?setTimeout((()=>{e.removeListener("data",d),e.removeListener("error",p),e.removeListener("end",l),n.end((()=>{try{n.destroy(),e.destroy()}catch(e){o&&o.error(e)}s(new Error(`response timeout ${r.timeout}`))}))}),r.timeout):null;let c=0;const d=t=>{c+=t.length,r.maxResponse&&r.maxResponse<c?(e.removeListener("data",d),e.removeListener("error",p),e.removeListener("end",l),n.end((()=>{try{n.destroy(),e.destroy()}catch(e){o&&o.error(e)}s(new Error(`response too big maxResponse ${r.maxResponse} < ${c}`))}))):a.push(t)},p=t=>{e.removeListener("data",d),e.removeListener("end",l),e.removeListener("error",p);try{n.destroy(),e.destroy()}catch(e){o&&o.error(e)}s(t)},l=()=>{try{u&&clearTimeout(u),e.removeListener("data",d),e.removeListener("error",p),i(a)}catch(e){s(e)}};try{e.on("data",d),e.once("error",p),e.once("end",l)}catch(t){return e.removeListener("data",d),e.removeListener("end",l),e.removeListener("error",p),void s(t)}}catch(e){return void s(e)}},t.parseRedirectLocation=(e,t,r)=>{const o=(e,n,o)=>({queryStr:s(e.searchParams,t).toString(),protocol:o?"http:":e.protocol,hash:e.hash,pathname:e.pathname,socketPath:o?r:void 0,hostname:o?void 0:e.hostname,port:o?void 0:e.port,url:o?n:e.toString()});try{return o((0,n.newURL)(e),e)}catch(t){if(e&&e.length>0&&"/"===e[0])return o((0,n.newURL)(`http://localhost${e}`),e,!0);throw t}};class o extends Error{constructor(e,t,r,n,s,o,i){super("request ended with "+(e?`status [${e}]`:"no status")),this.status=e,this.headers=t,this.url=r,this.redirectedUrl=n,this.data=s,this.buffer=o,this.locations=i,this.name="ResponseError"}}t.ResponseError=o},741:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.request=void 0;const n=r(18),s=r(137);t.request=async function(e,t){let r=e.url;const o=new Headers,i=e.headers?e.headers:{};if(e.headers){const t=Object.keys(e.headers);for(const r of t){const t=e.headers[r];o.set(r,t?t.toString():"")}}const a=i[n.CONTENT_TYPE_HEADER]||i[n.CONTENT_TYPE_HEADER.toLowerCase()]||i[n.CONTENT_TYPE_HEADER.toUpperCase()],u=a?0===a.toString().toLocaleLowerCase().indexOf("application/json"):void 0,c=!a,d="string"==typeof e.data,p=!d&&(c||u);if(p&&c?o.set("Content-Type",n.JSON_TYPE):d&&c&&o.set("Content-Type",n.TEXT_TYPE),e.data=e.data?p?JSON.stringify(e.data):e.data:void 0,e.query){const t=(0,s.newURL)(e.url),n=Object.keys(e.query);for(const r of n){const n=e.query[r];if(n instanceof Array)for(const e of n)t.searchParams.append(r,e);else t.searchParams.append(r,n)}r=t.toString()}const l=await fetch(r,{headers:o,body:e.data,method:e.method?e.method:"GET",cache:"no-cache",redirect:e.followRedirect?"follow":"error",credentials:"same-origin",mode:"cors",referrerPolicy:"no-referrer"}),h={};l.headers.forEach(((e,t)=>{h[e]=t}));const f=l.status,m=await l.arrayBuffer();let v;const y=l.headers.get("content-type");if(y&&-1!==y.indexOf("json")){const e=new TextDecoder("utf-8");v=JSON.parse(e.decode(new Uint8Array(m)))}else y&&-1!==y.indexOf("text")&&(v=new TextDecoder("utf-8").decode(new Uint8Array(m)));if(!e.disableThrow&&f<200&&f>300)throw new n.ResponseError(f,h,r,null,v,m,[]);const g={url:r,status:f,locations:[],redirectedUrl:null,buffer:m,data:v,headers:h};return g.response=l,g}},137:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isBrowser=t.newURLSearchParams=t.newURL=void 0,t.newURL=(e,r)=>(r=r||((0,t.isBrowser)()?window.location.toString():void 0),new URL(e,r)),t.newURLSearchParams=e=>new URLSearchParams(e),t.isBrowser=()=>"undefined"!=typeof window},693:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.request=void 0;const n=r(137);let s;t.request=function(e,t){if(s)return s(e,t);if((0,n.isBrowser)()){const{request:n}=r(741);return s=n,n(e,t)}{const n="./node",{request:o}=r(636)(n);return s=o,o(e,t)}}},636:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=636,e.exports=t},481:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.renderOnElement=t.renderElementProps=void 0;const n=r(708);function s(e,t){const r=e.getAttributeNames(),s={};for(const o of r){const r=e.getAttribute(o);if(t&&r&&"{"===r.charAt(0)&&"}"===r.charAt(r.length-1)){const e=(0,n.get)(t,r.substring(1,r.length-1));if("function"==typeof e){const r=e;s[o]=r.bind(t)}else void 0!==e&&(s[o]=e)}else null!=r&&(s[o]=r)}return s}function o(e,t){const r=Object.keys(t);for(const n of r){const r=t[n];if("function"==typeof r)if("data-ref"===n)r(e);else if(0===n.indexOf("data-on-")){const t=n.substring("data-on-".length);e.addEventListener(t,r)}else console.error("Cannot use attribute [%s] with function as value. Only data-on-... and data-ref are allowed. Use custom events for using data-on... with custom events or use the helpers .emit and .registerEvent to use custom events.",n)}}t.renderElementProps=s,t.renderOnElement=function(e,t){if(e.render){const i=e.render();if("string"==typeof i){const a=(r=e,i.replace(/{[^}]*}/g,(e=>{const t=e.substring(1,e.length-1),s=(0,n.get)(r,t);return"function"==typeof s?e:"string"==typeof s||"boolean"==typeof s||"number"==typeof s?(0,n.parse)(String(s),"encodeHtml"):null==s?"":e})));if(void 0!==a){t.innerHTML=a;const r=t.querySelectorAll("*");for(let t=0;t<r.length;t++){const n=r[t],i=s(n,e),a=n,u=Object.keys(i).filter((e=>i[e]&&"object"==typeof i[e]));if(a.setProps&&u.length>0){const e={};for(const t of u)e[t]=i[t];a.setProps(e)}o(n,i)}e.afterRender&&e.afterRender()}}}var r}},455:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.Component=void 0;const n=r(481),s=r(530);class o extends HTMLElement{constructor(){super(),this._emitter=new s.EventEmitter,this._observer=new MutationObserver((e=>{const t={};for(const r of e)if("attributes"===r.type){const e=r.attributeName,n=this.getAttribute(e);t[e]=n}this.setProps(t)})),this.props=(0,n.renderElementProps)(this),this.state={}}connectedCallback(){this._observer.observe(this,{attributes:!0}),this.setProps((0,n.renderElementProps)(this),!1,!1),this.willMount(),this._renderOnElement(),this.didMount()}disconnectedCallback(){this._observer.disconnect(),this.didUnMount()}render(){}willMount(){}didMount(){}didUnMount(){}afterRender(){}emit(e){return this._emitter.emit(e,this)}registerEvent(e,t){return this._emitter.registerEvent(e,t)}setState(e,t=!1,r=!0){const n=this.state;if(this.state=t?e:{...this.state,...e},r&&this.isConnected&&this.didUpdate(this.props,n))return this._renderOnElement()}setProps(e,t=!1,r=!0){const n=this.props;if(this.props=t?e:{...this.props,...e},r&&this.isConnected&&this.didUpdate(n,this.state))return this._renderOnElement()}didUpdate(e,t){return!0}_renderOnElement(){return(0,n.renderOnElement)(this,this)}}t.Component=o},530:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.EventEmitter=void 0,t.EventEmitter=class{constructor(e){this.defaultOptions=e,this._events=new Map}emit(e,t){this._events.has(e)||this.registerEvent(e),t.dispatchEvent(this._events.get(e))}registerEvent(e,t){this._events.set(e,new Event(e,t||this.defaultOptions))}}},846:function(e,t,r){"use strict";var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),s=this&&this.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||n(t,e,r)};Object.defineProperty(t,"__esModule",{value:!0}),t.renderOnElement=void 0;var o=r(481);Object.defineProperty(t,"renderOnElement",{enumerable:!0,get:function(){return o.renderOnElement}}),s(r(455),t),s(r(275),t),s(r(683),t)},683:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.historyPushPath=t.RouteLink=t.Route=t.Router=void 0;const n=r(455),s=document.documentElement.getAttribute("data-router-base-path")?document.documentElement.getAttribute("data-router-base-path"):"";class o extends n.Component{constructor(){if(super(),this.popStateListener=()=>{this._updateActive()},this.props["data-default-element"]){const e=new i;e.setAttribute("data-element",this.props["data-default-element"]),e.setAttribute("data-default",""),this.appendChild(e)}}willMount(){window.addEventListener("popstate",this.popStateListener)}didMount(){this.state.routes=this._updateRoutes(!1),this.state.active=this._updateActive(!1)}didUnMount(){window.removeEventListener("popstate",this.popStateListener)}_updateRoutes(e=!0){const t=[],r=this.querySelectorAll("*");for(let e=0;e<r.length;e++){const n=r[e];n.isActive&&n.setState&&n instanceof i&&t.push(n)}return e&&this.setState({routes:t}),t}_updateActive(e=!0){let t;for(const e of this.state.routes)e.isActive(t||this.state.active)&&(t=e);return t!==this.state.active&&(this.state.active&&this.state.active.setState({active:!1}),t&&t.setState({active:!0}),e&&this.setState({active:t})),t}}t.Router=o;class i extends n.Component{constructor(){super()}isActive(e,t=!0){const r=s+this.props["data-path"];let n=location.pathname;n.length>1&&"/"!==n.charAt(n.length-1)&&(n+="/");let o=t?n===r||""===this.props["data-default"]:n===r;return e&&this!==e&&o&&e.isActive(e,!1)&&(o=!1),o}render(){return this.state.active?`<${this.props["data-element"]}></${this.props["data-element"]}>`:""}}t.Route=i;class a extends n.Component{constructor(){super(),this.clickListener=e=>{e.preventDefault(),u(this.props["data-path"])}}willMount(){this.addEventListener("click",this.clickListener)}didUnMount(){this.removeEventListener("click",this.clickListener)}}function u(e){window.history.pushState(null,null,s+e),window.dispatchEvent(new PopStateEvent("popstate"))}t.RouteLink=a,t.historyPushPath=u},275:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.OpenShadowRootComponent=t.ShadowRootComponent=void 0;const n=r(481),s=r(455),o=new WeakMap;class i extends s.Component{constructor(){super();const e=this.attachShadow({mode:"closed"});o.set(this,e)}_renderOnElement(){const e=o.get(this);return(0,n.renderOnElement)(this,e)}}t.ShadowRootComponent=i,t.OpenShadowRootComponent=class extends i{constructor(){super();const e=this.attachShadow({mode:"open"});o.set(this,e)}}}},t={};function r(n){var s=t[n];if(void 0!==s)return s.exports;var o=t[n]={exports:{}};return e[n].call(o.exports,o,o.exports,r),o.exports}r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{const{Component:e,Router:t,Route:n,RouteLink:s,historyPushPath:o}=r(846),{request:i}=r(693);customElements.define("my-404",class extends e{render(){return'<p>not found</p><route-link data-path="/"><a href="#">home link</a></route-link>'}}),customElements.define("my-home",class extends e{async click(){try{const e=await i({url:"/api/v1/feeds?other=otherValue1",query:{some:1,another:["1","2"],other:"otherValue"}});console.dir(e.data)}catch(e){console.error("error on request call"),console.error(e)}}render(){return'home <p data-on-click="{click}">click me</p>'}}),customElements.define("path-route",n),customElements.define("route-link",s),customElements.define("path-router",t)})()})();