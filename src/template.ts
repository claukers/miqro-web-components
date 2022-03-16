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

function getTemplateKey(location: TemplateLocation | string): string {
  return typeof location === "string" ? `${undefined}-${location}` : `${location.method}-${location.url}`;
}

interface Template {
  location?: TemplateLocation;
  content: string;
}

const templateCache: Map<string, Template> = new Map();

export abstract class TemplateLoader {

  public static renderTemplate(component: Component, location: TemplateLocation | string): string | void {
    if (location && component) {
      location = typeof location === "string" ? {
        url: location
      } : location;
      const key = getTemplateKey(location);
      const template = TemplateLoader.getTemplate(location);
      if (!template) {
        // reload when loading finishes
        TemplateLoader.preLoad(location).then(([template]) => {
          component.setState({
            ["_template"]: location
          });
        }).catch(e => {
          console.error(e);
        });
      } else {
        return template.content;
      }
    }
  }

  public static async preLoad(location: string | TemplateLocation | Array<TemplateLocation | string>, force: boolean = false): Promise<Template[]> {
    const list = (location instanceof Array ? location : [location]).map(l => typeof l === "string" ? {url: l} : l) as TemplateLocation[];
    const templates: Template[] = []
    await Promise.allSettled(list.map(l => new Promise<void>(async (resolve, reject) => {
      try {
        const key = getTemplateKey(l);
        if (force || !this.hasTemplate(l)) {
          const response = await request(l);
          const template = {
            location: l,
            content: response.data
          };
          templateCache.set(key, template);
          templates.push(template)
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    })));
    return templates;
  }

  public static hasTemplate(location: string | TemplateLocation): boolean {
    const key = getTemplateKey(location);
    return templateCache.has(key);
  }

  public static getTemplate(location: string | TemplateLocation): Template | undefined {
    const key = getTemplateKey(location);
    return templateCache.get(key);
  }
}
