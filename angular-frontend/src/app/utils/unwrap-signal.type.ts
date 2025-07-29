import { Signal } from '@angular/core';

/**
 * Extracts the value type  U  from  Signal<U>.
 */
export type UnwrapSignal<T> = T extends Signal<infer U> ? U : never;