declare type Nullable<T> = T | null;
type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
declare type Booleanish = boolean | 'true' | 'false';
declare module 'focus-visible';
declare module 'css-paint-polyfill';
declare module 'css-houdini-squircle/*';
declare namespace CSS {
  interface PropertyDefinition {
    name: string;
    syntax?: string;
    inherits: boolean;
    initialValue?: string;
  }
  function registerProperty(propertyDefinition: PropertyDefinition): void;
  namespace paintWorklet {
    export function addModule(url: URL | string): void;
  }
}
