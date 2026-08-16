import { addons } from "storybook/internal/manager-api";
import { okryshtoTheme } from "./theme";

addons.setConfig({
  theme: okryshtoTheme,
  sidebar: {
    showRoots: true,
  },
  toolbar: {
    // Design system is dark-only — hide the default theme/background noise.
  },
});
