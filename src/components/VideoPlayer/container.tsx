import { useRef, useCallback } from "react";
import { useVideoPlayerContext, useVideoPlayerRefs } from "@lib/contexts/video";
import { usingMobilePointer } from "@lib/mobile";
import { useIsMobile } from "@hooks/use-mobile";
import { ArrowLeftRight, Smartphone } from "lucide-react";
import { cn } from "@utils/classMerge";
import type { ReactElement, FC, PropsWithChildren } from "react";
import type { VideoPlayerStore, VideoPlayerActions } from "@lib/stores/video";

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
  const timeoutRef = useRef<number>(null);
  const isFullscreen = useVideoPlayerContext<boolean>(
    (state: VideoPlayerStore): boolean => state.state.events.isFullscreen,
  );
  const isMouseOver = useVideoPlayerContext<boolean>(
    (state: VideoPlayerStore): boolean => state.state.events.isMouseOver,
  );
  const isMouseOverControlBar = useVideoPlayerContext<boolean>(
    (state: VideoPlayerStore): boolean =>
      state.state.events.isMouseOverControlBar,
  );
  const isVolumeMenuOpen = useVideoPlayerContext<boolean>(
    (state: VideoPlayerStore): boolean => state.state.events.isVolumeMenuOpen,
  );
  const isSpeedMenuOpen = useVideoPlayerContext<boolean>(
    (state: VideoPlayerStore): boolean => state.state.events.isSpeedMenuOpen,
  );
  const setEvent = useVideoPlayerContext<VideoPlayerActions["setEvent"]>(
    (store: VideoPlayerStore): VideoPlayerActions["setEvent"] =>
      store.actions.setEvent,
  );
  const handleMouseMove = useCallback((): void => {
    if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    if (!isMouseOver) setEvent("isMouseOver", true);

    timeoutRef.current = setTimeout((): void => {
      if (isMouseOverControlBar) return;
      if (isVolumeMenuOpen && isSpeedMenuOpen) return;

      setEvent("isMouseOver", false);
    }, 1250);
  }, [isSpeedMenuOpen, isVolumeMenuOpen, isMouseOver, isMouseOverControlBar]);
  const handleMouseLeave = useCallback((): void => {
    if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    if (isVolumeMenuOpen && isSpeedMenuOpen) return;

    setEvent("isMouseOver", false);
  }, [isSpeedMenuOpen, isVolumeMenuOpen]);
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
      <div
        ref={containerRef}
        className={containerClasses}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
