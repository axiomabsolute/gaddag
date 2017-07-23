import * as vg from 'vega';

declare module 'vg' {
  export function embed(el: Element, spec: string, opt: any): void;
}