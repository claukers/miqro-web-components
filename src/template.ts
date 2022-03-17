import {Component} from "./component.js";
import {request} from "@miqro/request";

interface TemplateLocation {
  url: string;
  method?: string;
  headers?: {
    [name: string]: string
  };
  followRedirect?: boolean;
}

export interface Template {
  location?: TemplateLocation;
  content: string;
}

export abstract class TemplateLoader {

  public static _templateCache: { [key: string]: Template } = {};

  public static getTemplateKey(location: TemplateLocation | string): string {
    return typeof location === "string" ? location : `${location.url}`;
  }

  public static renderTemplate(component: Component, location: TemplateLocation | string): string | void {
    if (location && component) {
      location = typeof location === "string" ? {
        url: location
      } : location;
      const template = TemplateLoader.getTemplate(location);
      if (!template) {
        // reload when loading finishes
        TemplateLoader.preLoad(location).then(([template]) => {
          if (template) {
            component.setState({
              ["_template"]: location
            });
          } else {
            console.error("cannot load template on %s", (location as TemplateLocation).url);
          }
        }).catch(e => {
          console.error(e);
        });
      } else {
        return template.content;
      }
    }
  }

  public static async preLoad(location: string | TemplateLocation | Template | Array<TemplateLocation | Template | string>, force: boolean = false): Promise<Template[]> {
    const list = (location instanceof Array ? location : [location]).map(l => typeof l === "string" ? {url: l} : l);
    const templates: Template[] = []
    await Promise.allSettled(list.map(l => new Promise<void>(async (resolve, reject) => {
      try {
        if ((l as TemplateLocation).url) {
          const key = TemplateLoader.getTemplateKey(l as TemplateLocation);
          if (force || !this.hasTemplate(l as TemplateLocation)) {
            const response = await request(l as TemplateLocation);
            if (response.status < 200 || response.status >= 300) {
              throw new Error("bad template location");
            }
            const template = {
              location: l as TemplateLocation,
              content: response.data
            };
            TemplateLoader._templateCache[key] = template;
            templates.push(template)
          }
          resolve();
        } else if (force && (l as Template).location && (l as Template).content) {
          const key = TemplateLoader.getTemplateKey((l as Template).location as TemplateLocation);
          TemplateLoader._templateCache[key] = (l as Template);
          templates.push((l as Template))
          resolve();
        } else {
          reject(new Error("bad location"));
        }
      } catch (e) {
        reject(e);
      }
    })));
    return templates;
  }

  public static hasTemplate(location: string | TemplateLocation): boolean {
    const key = TemplateLoader.getTemplateKey(location);
    return TemplateLoader._templateCache[key] !== undefined;
  }

  public static getTemplate(location: string | TemplateLocation): Template | undefined {
    const key = TemplateLoader.getTemplateKey(location);
    return TemplateLoader._templateCache[key];
  }
}
