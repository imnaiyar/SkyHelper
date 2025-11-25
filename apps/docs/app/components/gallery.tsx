import { ReactNode } from "react";
import Collapsible from "./collapsible";

import { ImageZoom } from "fumadocs-ui/components/image-zoom";
export interface GalleryOptions {
  images: { url: string; alt?: string }[];
  layout?: "vertical" | "horizontal";
  title?: string;
  className?: string;
}
export function Card({
  className = "",
  children,
  height = 200,
  width = 200,
}: {
  className?: string;
  children: ReactNode;
  height?: number;
  width?: number;
}) {
  return (
    <div
      className={"rounded-lg p-2 transition-shadow items-center hover:shadow-md flex justify-center" + ` ${className}`}
      style={{
        backgroundColor: "var(--color-fd-surface, var(--color-fd-background))",
        border: "1px solid var(--color-fd-border, rgba(0,0,0,0.06))",
        height,
        width,
      }}
    >
      {children}
    </div>
  );
}
export default function Gallery({ images, layout = "horizontal", title = "Images", className = "" }: GalleryOptions) {
  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 200;
  const cols = layout === "horizontal" ? "grid-cols-3" : "grid-cols-1";

  return (
    <Collapsible title={title}>
      <div className={`grid ${cols} items-start gap-2 ${className}`}>
        {images.map((img, i) => (
          <Card key={`card-${i}`}>
            <ImageZoom
              src={img.url}
              alt={img.alt ?? `Image-${i}`}
              height={CARD_HEIGHT}
              width={CARD_WIDTH}
              style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
            />
          </Card>
        ))}
      </div>
    </Collapsible>
  );
}
