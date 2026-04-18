import { useVideoPlayerContext, useVideoPlayerRefs } from "@lib/contexts/video";
import { usingMobilePointer } from "@lib/mobile";
import { useIsMobile } from "@hooks/use-mobile";
import { ArrowLeftRight, Smartphone } from "lucide-react";
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
  const { containerRef } = useVideoPlayerRefs();
  const isMobile = useIsMobile();
  const isMobilePointer = usingMobilePointer();
  const isFullscreen = useVideoPlayerContext<boolean>(
    (state: VideoPlayerStore): boolean => state.state.events.isFullscreen,
  );
  const containerClasses: string = cn(
    "relative overflow-visible aspect-video w-full",
    className,
    {
      "rounded-none": isFullscreen,
      "rounded-xl": !isFullscreen,
    },
  );

  if (!isMobilePointer || !isMobile) {
    return (
      <div ref={containerRef} className={containerClasses}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-md:relative max-md:left-1/2 max-md:w-screen max-md:max-w-[100vw] max-md:-translate-x-1/2 max-md:bg-black",
      )}
    >
      <div
        ref={containerRef}
        className={cn(containerClasses, "max-md:rounded-none")}
      >
        {children}
      </div>
      <div
        className="pointer-events-none flex justify-center px-4 py-3 max-md:landscape:hidden"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-center text-sm font-medium text-white/90 backdrop-blur-sm">
          <Smartphone
            className="size-5 shrink-0 text-mango-yellow"
            aria-hidden
          />
          <ArrowLeftRight
            className="size-4 shrink-0 text-mango-yellow/80"
            aria-hidden
          />
          <span>Rotate sideways for full-width video</span>
        </div>
      </div>
    </div>
  );
}
