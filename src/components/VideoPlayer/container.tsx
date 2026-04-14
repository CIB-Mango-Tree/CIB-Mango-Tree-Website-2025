import { useRef, useEffect } from "react";
import { useVideoPlayerContext } from "@lib/contexts/video";
import { usingMobilePointer } from "@lib/mobile";
import { cn } from "@utils/classMerge";
import type { ReactElement, FC, PropsWithChildren } from "react";
import type { VideoPlayerStore } from "@lib/stores/video";

export interface VideoPlayerContainerProps extends PropsWithChildren {
  className?: string;
}

export function VideoPlayerContainer({
  className,
  children,
}: VideoPlayerContainerProps): ReactElement<FC> {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFullscreen = useVideoPlayerContext<boolean>(
    (state: VideoPlayerStore): boolean => state.state.events.isFullscreen,
  );
  const containerClasses: string = cn("relative", className, {
    "rounded-none": isFullscreen,
    "rounded-xl": !isFullscreen,
  });

  useEffect((): void => {
    if (!isFullscreen || !usingMobilePointer()) return;

    containerRef.current?.requestFullscreen();
  }, [isFullscreen]);

  return (
    <div ref={containerRef} className={containerClasses}>
      {children}
    </div>
  );
}
