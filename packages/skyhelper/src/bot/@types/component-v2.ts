import type { APIActionRowComponent, APIButtonComponent } from "@discordjs/core";

export enum MessageV2Flags {
  // This flag is required to use the new components
  IS_COMPONENTS_V2 = 32768,
}

export enum ComponentV2Type {
  // New stuff
  SECTION = 9,
  TEXT_DISPLAY = 10,
  THUMBNAIL = 11,
  MEDIA_GALLERY = 12,
  FILE = 13,
  SEPARATOR = 14,
  CONTAINER = 17,
}

export interface UnfurledMediaItem {
  // Supports arbitrary urls _and_ attachment://<filename> references
  url: string;
}

export interface BaseComponent {
  type: ComponentV2Type;
  id?: number;
}

export interface SectionComponent extends BaseComponent {
  type: ComponentV2Type.SECTION;
  components: TextDisplayComponent[];
  // DO NOT hardcode assumptions that this will only be Thumbnail.
  // Eventually this will support Button and others
  accessory: ThumbnailComponent | APIButtonComponent;
}

export interface TextDisplayComponent extends BaseComponent {
  type: ComponentV2Type.TEXT_DISPLAY;
  content: string;
}

export interface ThumbnailComponent extends BaseComponent {
  type: ComponentV2Type.THUMBNAIL;
  media: UnfurledMediaItem;
  description?: string;
  spoiler?: boolean;
}

export interface MediaGalleryItem {
  media: UnfurledMediaItem;
  description?: string;
  spoiler?: boolean;
}

export interface MediaGalleryComponent extends BaseComponent {
  type: ComponentV2Type.MEDIA_GALLERY;
  items: MediaGalleryItem[];
}

export enum SeparatorSpacingSize {
  SMALL = 1,
  LARGE = 2,
}

export interface SeparatorComponent extends BaseComponent {
  type: ComponentV2Type.SEPARATOR;
  divider?: boolean;
  spacing?: SeparatorSpacingSize;
}

export interface FileComponent extends BaseComponent {
  type: ComponentV2Type.FILE;
  // The UnfurledMediaItem ONLY supports attachment://<filename> references
  file: UnfurledMediaItem;
  spoiler?: boolean;
}

export interface ContainerComponent extends BaseComponent {
  type: ComponentV2Type.CONTAINER;
  accent_color?: number;
  spoiler?: boolean;
  components: Array<
    | APIActionRowComponent<APIButtonComponent>
    | TextDisplayComponent
    | SectionComponent
    | MediaGalleryComponent
    | SeparatorComponent
    | FileComponent
  >;
}
