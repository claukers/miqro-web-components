import {IVDOMNode, parseTemplateXML, renderVDOMDiffOn, VDOMNode} from "./vdom/index.js";
import {cancelRender} from "./render-queue.js";
import {
  log,
  LOG_LEVEL,
  parseXML,
  RenderFunction,
  RenderTemplateArgs,
  TemplateValues,
  weakMapGet,
  weakMapHas,
  weakMapSet
} from "../common/index.js";

export type ApplyRenderCallback = () => boolean;

export function disconnect(component: Node) {
  cancelRender(component);
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, component);
  if (oldTemplate) {
    disconnectAll(oldTemplate.output);
  }
}

export function hasCache(component: Node): boolean {
  return weakMapHas.call(lastTemplateMap, component);
}

export async function render(abortController: AbortController, element: Node, renderFunction: RenderFunction): Promise<{ apply: ApplyRenderCallback } | undefined> {
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

  const out: RenderTemplateArgs = typeof renderOutput === "string" ? {
    template: renderOutput ? renderOutput : "",
    values: {}
  } : {
    template: renderOutput && renderOutput.template ? renderOutput.template : "",
    values: renderOutput && renderOutput.values ? renderOutput.values : {}
  };

  if (out && out.template !== undefined) {
    const {output, xmlDocument} = await renderTemplateOnElement(element, out.template, out.values);
    if (abortController.signal.aborted) {
      log(LOG_LEVEL.trace, "render aborted %o", element);
      return;
    }

    return {
      apply: () => {
        if (abortController.signal.aborted) {
          log(LOG_LEVEL.trace, "render aborted %o", element);
          return false;
        }
        return applyRender(abortController, element, out.template, xmlDocument, output);
      }
    };
  }
}

async function renderTemplateOnElement(element: Node, template: string, values: TemplateValues): Promise<{ output: VDOMNode<Node>[] | undefined; xmlDocument: XMLDocument; }> {
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, element);

  const xmlDocument = oldTemplate && oldTemplate.template === template ?
    oldTemplate.xmlDocument :
    parseXML(template)

  const output = await parseTemplateXML(template, values, xmlDocument);

  return {output, xmlDocument};
}

function applyRender(abortController: AbortController, element: Node, template: string, xmlDocument: XMLDocument, output?: VDOMNode<Node>[]): boolean {
  if (abortController.signal.aborted) {
    log(LOG_LEVEL.trace, "render aborted %o", element);
    return false;
  }
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, element);
  if (output) {
    const ret = renderVDOMDiffOn(element, output, oldTemplate?.output);
    weakMapSet.call(lastTemplateMap, element, {output, template, xmlDocument} as TemplateMapValue);
    if (oldTemplate) {
      disconnectAll(oldTemplate.output);
    }
    return ret;
  }
  return false;
}

interface TemplateMapValue {
  output: IVDOMNode[];
  xmlDocument: XMLDocument;
  template: string;
}

const lastTemplateMap = new WeakMap<Node, TemplateMapValue>();

function disconnectAll(nodes: IVDOMNode[]): void {
  for (const n of nodes) {
    const children = n.children;
    n.disconnect(n.ref as Node);
    if (children) {
      disconnectAll(children);
    }
  }
}
