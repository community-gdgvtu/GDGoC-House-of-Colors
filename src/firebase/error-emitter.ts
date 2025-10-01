
import { EventEmitter } from 'events';

// This is a simple event emitter that will be used to pass errors
// from where they are caught to a listener component at the root of the app.
export const errorEmitter = new EventEmitter();
