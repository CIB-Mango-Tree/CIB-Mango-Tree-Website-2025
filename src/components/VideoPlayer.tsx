interface VideoPlayerProps {
    src: string;
    label?: string;
}

export default function VideoPlayer({ src, label }: VideoPlayerProps) {
  return (
    <video
      src={src}
      className="w-full"
      autoPlay
      loop
      muted
      playsInline
      aria-label={label ?? "CIB Mango Tree Demo Video"}
    />
  );
}
