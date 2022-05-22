import {TemplateValues, RefreshCallback, IComponent} from "./template/index.js";
import {render as realRender} from "./render.js";

const refreshTimeouts = new WeakMap<IComponent, { timeout: any, preRenders: (() => void)[], listeners: (() => void)[] }>();

export function render(component: IComponent, template?: string, values?: TemplateValues, listener?: () => void, preRender?: () => void): void {
  const oldRefreshTimeout = refreshTimeouts.get(component);
  if (oldRefreshTimeout) {
    clearTimeout(oldRefreshTimeout.timeout);
  }
  // console.log("queue render for %s", component.tagName);
  const currentListeners = (oldRefreshTimeout && oldRefreshTimeout.listeners ? oldRefreshTimeout.listeners : []);
  const currentPreRenders = (oldRefreshTimeout && oldRefreshTimeout.preRenders ? oldRefreshTimeout.preRenders : []);
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
          realRender(component, template, values);
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
    listeners: listener ? currentListeners.concat(listener) : currentListeners,
    preRenders: preRender ? currentPreRenders.concat(preRender) : currentPreRenders
  });

}
