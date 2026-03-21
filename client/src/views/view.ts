import type Listeners from "../listener";

abstract class View<L extends Listeners<T>, T> {
  protected listeners: L;

  constructor(listeners: L) {
    this.listeners = listeners;
  }

  public listen<K extends keyof T>(type: K, listener: (value: T[K]) => void) {
    this.listeners.listen(type, listener);
  }
}

export default View;
