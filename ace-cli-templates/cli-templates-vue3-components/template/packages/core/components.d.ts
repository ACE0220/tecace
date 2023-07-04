import * as components from "<%= projectName %>-comps";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    LButton: typeof components.LButton;
  }
}
