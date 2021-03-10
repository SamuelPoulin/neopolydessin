export class Observable<T> {

  observers: ((obj: T) => void)[];

  constructor() {
    this.observers = [];
  }

  subscribe(observer: (obj: T) => void) {
    this.observers.push(observer);
  }

  unsubscribe(observer: (obj: T) => void) {
    this.observers = this.observers.filter((subscriber) => subscriber !== observer);
  }

  notify(obj: T) {
    this.observers.forEach((observer) => observer(obj));
  }
}