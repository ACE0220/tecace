import * as components from "./index";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    LButton: typeof components.LButton;
  }
}
