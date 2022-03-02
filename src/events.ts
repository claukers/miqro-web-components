export interface IEventEmitter {
  emit(event: string): void;

  registerEvent(event: string, eventOptions?: EventInit): void;
}

export class EventCacheEmitter {

  private _events: Map<string, Event> = new Map<string, Event>();

  constructor(public defaultOptions?: EventInit) {
  }

  public emit(event: string, element: Element | ShadowRoot): void {
    if (!this._events.has(event)) {
      this.registerEvent(event);
    }
    element.dispatchEvent(this._events.get(event) as Event);
  }

  public registerEvent(event: string, eventOptions?: EventInit): void {
    this._events.set(event, new Event(event, eventOptions ? eventOptions : this.defaultOptions));
  }
}
