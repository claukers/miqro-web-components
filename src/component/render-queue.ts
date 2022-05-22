import {TemplateValues, RefreshCallback, IComponent} from "./template/index.js";
import {render as realRender} from "./render.js";

const refreshTimeouts = new WeakMap<IComponent, { timeout: any, preRenders: (() => void)[], listeners: (() => void)[] }>();

export function render(component: IComponent, template?: string, values?: TemplateValues, listener?: () => void, preRender?: () => void, refresh?: RefreshCallback): void {
  const refreshTimeout = refreshTimeouts.get(component);
  if (refreshTimeout) {
    clearTimeout(refreshTimeout.timeout);
  }
  // console.log("queue render for %s", component.tagName);
  refresh = refresh ? refresh : () => {
    render(component, template, values, undefined, undefined, refresh);
  };
  const listeners = (refreshTimeout && refreshTimeout.listeners ? refreshTimeout.listeners : []);
  const preRenders = (refreshTimeout && refreshTimeout.preRenders ? refreshTimeout.preRenders : []);
  refreshTimeouts.set(component, {
    timeout: setTimeout(() => {
      try {
        const refreshTimeout = refreshTimeouts.get(component);
        if (refreshTimeout) {
          refreshTimeouts.delete(component);
          const listeners = refreshTimeout.listeners;
          const preRenders = refreshTimeout.preRenders;
          for (const preRender of preRenders) {
            try {
              preRender();
            } catch (e) {
              console.error(e);
            }
          }
          realRender(component, template, values, refresh);
          for (const listener of listeners) {
            try {
              listener();
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 0),
    listeners: listener ? listeners.concat(listener) : listeners,
    preRenders: preRender ? preRenders.concat(preRender) : preRenders
  });

}
