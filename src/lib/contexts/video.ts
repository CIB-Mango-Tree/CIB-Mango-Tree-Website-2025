import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";
import type { VideoPlayerStore } from "@lib/stores/video";

export type VideoPlayerStoreApi = StoreApi<VideoPlayerStore>;
export const VideoPlayerContext = createContext<VideoPlayerStoreApi | null>(
  null,
);

export function useVideoPlayerContext<Out>(
  selector: (state: VideoPlayerStore) => Out,
): Out {
  const context = useContext<VideoPlayerStoreApi | null>(VideoPlayerContext);

  if (context == null) throw new Error("missing video player provider");

  return useStore(context, selector);
}
