import { ApplicationStart } from "opensearch-dashboards/public";
import { createContext } from "react";
import { NavigationPublicPluginStart } from "src/plugins/navigation/public";

export interface NavigationMenuProperties {
  navigationUI: NavigationPublicPluginStart['ui'];
  showActionsInHeader: boolean;
  application: ApplicationStart;
}

const NavigationMenuContext = createContext<NavigationMenuProperties>({
    navigationUI: {} as NavigationPublicPluginStart['ui'],
    showActionsInHeader: false,
    application: {} as ApplicationStart,
});

const NavigationMenuConsumer = NavigationMenuContext.Consumer;

export { NavigationMenuContext, NavigationMenuConsumer };
