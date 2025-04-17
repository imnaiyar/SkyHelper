import {
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIContainerComponent,
  type APIComponentInContainer,
  type APIFileComponent,
  type APIMediaGalleryComponent,
  type APIMediaGalleryItem,
  type APIComponentInMessageActionRow,
  type APISectionComponent,
  type APISeparatorComponent,
  type APITextDisplayComponent,
  type APIThumbnailComponent,
  type APIUnfurledMediaItem,
} from "discord-api-types/v10";

export function container(
  component: APIComponentInContainer | APIComponentInContainer[],
  ...comps: APIComponentInContainer[]
): APIContainerComponent {
  const components = Array.isArray(component) ? component : [component];
  components.push(...comps);
  return {
    type: ComponentType.Container,
    components,
  };
}

export function textDisplay(content: string, ...contents: string[]): APITextDisplayComponent {
  return {
    type: ComponentType.TextDisplay,
    content: [content, ...contents].join("\n"),
  };
}

export function thumbnail(url: string, description?: string, spoiler?: boolean): APIThumbnailComponent {
  return {
    type: ComponentType.Thumbnail,
    media: {
      url,
    },
    description,
    spoiler,
  };
}
export function mediaGalleryItem(
  url: string,
  extra?: Omit<APIMediaGalleryItem, "media"> & { media?: Omit<APIUnfurledMediaItem, "url"> },
): APIMediaGalleryItem {
  return {
    ...extra,
    media: { url, ...extra?.media },
  };
}
export function mediaGallery(
  item: APIMediaGalleryItem | APIMediaGalleryItem[],
  ...itms: APIMediaGalleryItem[]
): APIMediaGalleryComponent {
  const items = Array.isArray(item) ? item : [item];
  items.push(...itms);
  return {
    type: ComponentType.MediaGallery,
    items,
  };
}

export function separator(divider = true, spacing = 2): APISeparatorComponent {
  return {
    type: ComponentType.Separator,
    divider,
    spacing,
  };
}

export function section(
  accessory: APIThumbnailComponent | APIButtonComponent,
  content: string,
  ...contents: string[]
): APISectionComponent {
  return {
    type: ComponentType.Section,
    accessory,
    components: [content, ...contents].map((c) => textDisplay(c)),
  };
}

export function file(url: string, spoiler?: boolean): APIFileComponent {
  return {
    type: ComponentType.File,
    file: {
      url,
    },
    spoiler,
  };
}

export function row(
  component: APIComponentInMessageActionRow | APIComponentInMessageActionRow[],
  ...comps: APIComponentInMessageActionRow[]
): APIActionRowComponent<APIComponentInMessageActionRow> {
  const components = Array.isArray(component) ? component : [component];
  components.push(...comps);
  return {
    type: ComponentType.ActionRow,
    components,
  };
}
