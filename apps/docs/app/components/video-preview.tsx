import { Card } from "./gallery";

export const VideoPreview = ({ src, thumbnail }: { src: string; thumbnail: string }) => {
  return (
    <Card height={300} width={400}>
      <div className="relative w-full h-auto">
        <video src={src} controls className="rounded-lg w-full h-auto" />
      </div>
    </Card>
  );
};
