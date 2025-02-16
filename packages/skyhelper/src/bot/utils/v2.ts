import {
  ComponentV2Type,
  type ContainerComponent,
  type ContainerComponents,
  type FileComponent,
  type MediaGalleryComponent,
  type SectionComponent,
  type SeparatorComponent,
  type TextDisplayComponent,
  type ThumbnailComponent,
} from "@/types/component-v2";
import { type APIButtonComponent } from "@discordjs/core";

export function container(...components: ContainerComponents): ContainerComponent {
  return {
    type: ComponentV2Type.CONTAINER,
    components,
  };
}

export function textDisplay(content: string): TextDisplayComponent {
  return {
    type: ComponentV2Type.TEXT_DISPLAY,
    content,
  };
}

export function thumbnail(url: string, description?: string, spoiler?: boolean): ThumbnailComponent {
  return {
    type: ComponentV2Type.THUMBNAIL,
    media: {
      url,
    },
    description,
    spoiler,
  };
}

export function mediaGallery(...items: { url: string; description?: string; spoiler?: boolean }[]): MediaGalleryComponent {
  return {
    type: ComponentV2Type.MEDIA_GALLERY,
    items: items.map(({ url, description, spoiler }) => ({
      media: { url },
      description,
      spoiler,
    })),
  };
}

export function separator(divider = true, spacing = 2): SeparatorComponent {
  return {
    type: ComponentV2Type.SEPARATOR,
    divider,
    spacing,
  };
}

export function section(accessory: ThumbnailComponent | APIButtonComponent, ...contents: string[]): SectionComponent {
  return {
    type: ComponentV2Type.SECTION,
    accessory,
    components: contents.map(textDisplay),
  };
}

export function file(url: string, spoiler?: boolean): FileComponent {
  return {
    type: ComponentV2Type.FILE,
    file: {
      url,
    },
    spoiler,
  };
}
