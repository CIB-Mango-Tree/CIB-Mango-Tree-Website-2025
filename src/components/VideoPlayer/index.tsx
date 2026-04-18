"use client";

import { useRef, useState } from "react";
import { createVideoPlayerStore } from "@lib/stores/video";
import {
  VideoPlayerContext,
  VideoPlayerRefsContext,
} from "@lib/contexts/video";
import { VideoPlayerContainer } from "@components/VideoPlayer/container";
import { VideoPlayerWindow } from "@components/VideoPlayer/window";
import { VideoPlayerControlBar } from "@components/VideoPlayer/controls";
import { VideoPlayerIconOverlay } from "@components/VideoPlayer/overlays";
import { TooltipProvider } from "@components/ui/tooltip";
import type { ReactElement, FC } from "react";
import type { VideoPlayerStoreApi } from "@lib/contexts/video";

export interface VideoPlayerProps {
  src: string;
  type: string;
  poster?: string;
  label?: string;
  className?: string;
  muted?: boolean;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  src,
  type,
  poster,
  className,
  autoPlay = false,
  muted = false,
  label = "cibmangotree video player",
}: VideoPlayerProps): ReactElement<FC> {
  const [store] = useState<VideoPlayerStoreApi>(createVideoPlayerStore());
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef(null);

  return (
    <VideoPlayerContext.Provider value={store}>
      <VideoPlayerRefsContext.Provider value={{ videoRef, containerRef }}>
        <TooltipProvider>
          <VideoPlayerContainer className={className}>
            <VideoPlayerIconOverlay />
            <VideoPlayerWindow
              src={src}
              type={type}
              poster={poster}
              label={label}
              muted={muted}
              autoPlay={autoPlay}
            />
            <VideoPlayerControlBar />
          </VideoPlayerContainer>
        </TooltipProvider>
      </VideoPlayerRefsContext.Provider>
    </VideoPlayerContext.Provider>
  );
}
