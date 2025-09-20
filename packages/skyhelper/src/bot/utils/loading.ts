import {
  ComponentType,
  type APIButtonComponentWithCustomId,
  type APIComponentInContainer,
  type APIMessageTopLevelComponent,
  type APIStringSelectComponent,
} from "discord-api-types/v10";
const setButtonState = (b: APIButtonComponentWithCustomId, id: string) => ({
  ...b,
  custom_id: id,
  disabled: true,
  style: 2,
  label: "Loading...",
  emoji: { id: "1228956650757427220", animated: true },
});

const setSelectMenuState = (s: APIStringSelectComponent, id: string) => ({
  ...s,
  options: [
    {
      label: "Loading",
      value: "l",
      default: true,
      emoji: { id: "1228956650757427220", animated: true },
    },
  ],
  disabled: true,
});
// recursively find the button with the given custom_id and update it to `loading`
export function setLoadingState(components: APIMessageTopLevelComponent[], customId: string) {
  const cloned = [...components];
  for (const component of cloned) {
    // container
    if (component.type === ComponentType.Container) {
      for (const innerComponent of component.components) {
        setLoading(innerComponent, customId);
      }
    }
    if (component.type === ComponentType.ActionRow || component.type === ComponentType.Section) setLoading(component, customId);
  }
  return cloned;
}

function setLoading(component: APIComponentInContainer, customId: string) {
  if (component.type === ComponentType.Section) {
    const comp = component.accessory;
    if (comp.type !== ComponentType.Button) return;
    if ("custom_id" in comp && comp.custom_id === customId) component.accessory = setButtonState(comp, customId);
  }

  // action row
  if (component.type === ComponentType.ActionRow) {
    for (const innerComponent of component.components) {
      // button
      if (innerComponent.type === ComponentType.Button) {
        if ("custom_id" in innerComponent && innerComponent.custom_id === customId) {
          const index = component.components.indexOf(innerComponent);
          if (index !== -1) {
            component.components[index] = setButtonState(innerComponent, customId);
          }
        }
      }

      // select menu
      if (innerComponent.type === ComponentType.StringSelect) {
        if ("custom_id" in innerComponent && innerComponent.custom_id === customId) {
          const index = component.components.indexOf(innerComponent);
          if (index !== -1) {
            component.components[index] = setSelectMenuState(innerComponent, customId);
          }
        }
      }
    }
  }
}
