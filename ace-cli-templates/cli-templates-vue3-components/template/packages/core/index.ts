import * as components from "<%= projectName %>-comps";

import type { App } from "vue";

export default {
  install: (app: App) => {
    for (const c in components) {
      const comp = components[c as keyof typeof components];
      app.use(comp);
    }
  },
};
