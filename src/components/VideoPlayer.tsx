import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  Play,
  Pause,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Fullscreen,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Slider } from "@components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { cn } from "@utils/classMerge";
import type { ReactElement, FC, PropsWithChildren } from "react";

export type VolumeLiterals = "high" | "low" | "silent" | "mute";

export interface VideoPlayerProps {
  src: string;
  type: string;
  poster?: string;
  start?: number;
  className?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onVolume?: () => void;
  onFullscreen?: () => void;
  onNormalScreen?: () => void;
  onTrack?: () => void;
}

export default function VideoPlayer({
  src,
  type,
  poster,
  className,
  start,
  autoPlay,
}: VideoPlayerProps): ReactElement<FC> {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackValue, setTrackValue] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<VolumeLiterals>("high");
  const videoRef = useRef<HTMLVideoElement>(null);
  const handlePlayToggle = useCallback((): void => {
    if (videoRef.current == null) return;
    if (!videoRef.current.paused) {
      videoRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    (async (): Promise<void> => {
      await videoRef.current?.play();
      setIsPlaying(true);
      if (!hasStarted) setHasStarted(true);
    })();
  }, [isPlaying]);

  useEffect((): void => {
    if (autoPlay != null) setIsPlaying(autoPlay);
    if (start != null && start > 0) setTrackValue(start);
  }, []);

  return (
    <div className={cn("relative group/video-player rounded-xl", className)}>
      <video
        ref={videoRef}
        className="w-full h-auto aspect-video object-cover rounded-xl [[poster]]:object-cover [[poster]]:rounded-xl"
        poster={poster}
        playsInline
      >
        <source src={src} type={type} />
        Your browser does not support video playback. You may download the video
        <a
          download="file"
          href="CIB_Mango_Tree_Demo.mp4"
          className="decoration-2"
        >
          here
        </a>
        .
      </video>
      <div className="absolute left-0 right-0 bottom-4 grid grid-cols-12 gap-x-2 w-full z-10">
        <div className="grid col-span-1 items-center">
          <Button type="button" size="sm" onClick={handlePlayToggle}>
            {isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
          </Button>
        </div>
        <div className="grid col-span-10 items-center">
          <Slider
            max={videoRef.current?.duration || 100}
            step={1}
            value={trackValue}
          />
        </div>
        <div className="grid col-span-1 grid-flow-col items-center justify-between">
          <Button type="button" size="sm">
            <Volume />
          </Button>
          <Button type="button" size="sm">
            <Fullscreen />
          </Button>
        </div>
      </div>
    </div>
  );
}
