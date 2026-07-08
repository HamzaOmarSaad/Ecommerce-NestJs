// Events/EventHandler.ts

import EventEmitter from 'events';

export type EventMap = {
  'confirm-Email': {
    to: string;
    cc?: string;
    subject: string;
    html: string;
  };

  forgetPassword: {
    to: string;
    subject: string;
    html: string;
  };
};

export class EventHandler {
  constructor(private emitter: EventEmitter) {}

  publish<K extends keyof EventMap>(eventName: K, payload: EventMap[K]) {
    this.emitter.emit(eventName, payload);
  }

  subscribe<K extends keyof EventMap>(
    eventName: K,
    listener: (payload: EventMap[K]) => Promise<void> | void,
  ) {
    this.emitter.on(eventName, (payload: unknown) => {
      void (async () => {
        try {
          await listener(payload as EventMap[K]);
        } catch (error) {
          console.error(`Error in event ${eventName}:`, error);
        }
      })();
    });
  }
}

// import EventEmitter from "events";

// export type EventTypes = "confirm-Email" | "forgetPassword";

// export class EventHandler {
//   constructor(private emitter: EventEmitter) {}

//   public publish(eventName: EventTypes, ...args: any[]) {
//     this.emitter.emit(eventName, ...args);
//   }
//   public subscribe(
//     eventName: EventTypes,
//     listener: (...args: any[]) => void | Promise<void>,
//   ) {
//     this.emitter.on(eventName, listener);
//   }
// }
