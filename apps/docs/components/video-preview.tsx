import { Card } from "./card";

export const VideoPreview = ({ src }: { src: string }) => {
  return (
    <Card height={300} width={400}>
      <div className="relative w-full h-auto">
        <video src={src} controls className="rounded-lg w-full h-auto" />
      </div>
    </Card>
  );
};
