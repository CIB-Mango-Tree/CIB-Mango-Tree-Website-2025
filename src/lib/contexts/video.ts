import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { RefObject } from "react";
import type { StoreApi } from "zustand";
import type { VideoPlayerStore } from "@lib/stores/video";

export type VideoPlayerStoreApi = StoreApi<VideoPlayerStore>;
export type VideoPlayerRefs = {
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
};
export const VideoPlayerContext = createContext<VideoPlayerStoreApi | null>(
  null,
);
export const VideoPlayerRefsContext = createContext<VideoPlayerRefs | null>(null);

export function useVideoPlayerContext<Out>(
  selector: (state: VideoPlayerStore) => Out,
): Out {
  const context = useContext<VideoPlayerStoreApi | null>(VideoPlayerContext);

  if (context == null) throw new Error("missing video player provider");

  return useStore(context, selector);
}

export function useVideoPlayerContextStore(): StoreApi<VideoPlayerStore> {
  const context = useContext(VideoPlayerContext);
  if (context == null) throw new Error("missing video player provider");
  return context;
}

export function useVideoPlayerRefs(): VideoPlayerRefs {
  const context = useContext(VideoPlayerRefsContext);
  if (context == null) throw new Error("missing video player refs provider");
  return context;
}
