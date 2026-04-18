import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EMPTY } from "@utils/constants";
import type { WritableDraft } from "immer";

export type IconFlash = "play" | "pause" | typeof EMPTY;
export type VideoPlayerState = {
  events: {
    hasStarted: boolean;
    hasEnded: boolean;
    isPlaying: boolean;
    isStarting: boolean;
    isRestarting: boolean;
    isWaiting: boolean;
    isFullscreen: boolean;
    isVolumeMenuOpen: boolean;
    isSpeedMenuOpen: boolean;
    isMouseOver: boolean;
    isMouseOverControlBar: boolean;
    fullscreenTransition: boolean;
  };
  values: {
    time: number;
    duration: number;
    volume: number;
    buffered: number;
    playbackRate: number;
    iconFlash: IconFlash;
    autoPlay: boolean;
    muted: boolean;
  };
};
export type VideoPlayerStateEventKeys = keyof VideoPlayerState["events"];
export type VideoPlayerStateValueKeys = keyof VideoPlayerState["values"];
export type VideoPlayerStateHandlerPayload<Key extends keyof VideoPlayerState> =
  Partial<VideoPlayerState[Key]>;
export type VideoPlayerActions = {
  setEvent: <K extends VideoPlayerStateEventKeys>(
    key: K,
    value: VideoPlayerState["events"][K],
  ) => void;
  setEvents: (data: VideoPlayerStateHandlerPayload<"events">) => void;
  setValue: <K extends VideoPlayerStateValueKeys>(
    key: K,
    value: VideoPlayerState["values"][K],
  ) => void;
  setValues: (data: VideoPlayerStateHandlerPayload<"values">) => void;
  reset: () => void;
};
export type VideoPlayerStore = {
  state: VideoPlayerState;
  actions: VideoPlayerActions;
};

export const initialState: VideoPlayerState = {
  events: {
    hasStarted: false,
    hasEnded: false,
    isPlaying: false,
    isStarting: false,
    isRestarting: false,
    isWaiting: false,
    isFullscreen: false,
    isVolumeMenuOpen: false,
    isSpeedMenuOpen: false,
    isMouseOver: false,
    isMouseOverControlBar: false,
    fullscreenTransition: false,
  },
  values: {
    time: 0,
    duration: 0,
    volume: 0.5,
    buffered: 0,
    playbackRate: 1,
    iconFlash: EMPTY,
    autoPlay: false,
    muted: false,
  },
};

export function createVideoPlayerStore() {
  return createStore<VideoPlayerStore>()(
    immer<VideoPlayerStore, [], [], VideoPlayerStore>((set) => ({
      state: initialState,
      actions: {
        setEvent: <K extends VideoPlayerStateEventKeys>(
          key: K,
          value: VideoPlayerState["events"][K],
        ): void => {
          set((draft: WritableDraft<VideoPlayerStore>): void => {
            draft.state.events[key] = value;
          });
        },
        setEvents: (data: VideoPlayerStateHandlerPayload<"events">): void => {
          set((draft: WritableDraft<VideoPlayerStore>): void => {
            const events = draft.state.events as Record<string, boolean>;

            for (const key of Object.keys(data)) {
              events[key] = data[key as VideoPlayerStateEventKeys]!;
            }
          });
        },
        setValue: <K extends VideoPlayerStateValueKeys>(
          key: K,
          value: VideoPlayerState["values"][K],
        ): void => {
          set((draft: WritableDraft<VideoPlayerStore>): void => {
            draft.state.values[key] = value;
          });
        },
        setValues: (data: VideoPlayerStateHandlerPayload<"values">): void => {
          set((draft: WritableDraft<VideoPlayerStore>): void => {
            const values = draft.state.values as Record<
              string,
              number | boolean | IconFlash
            >;

            for (const key of Object.keys(data)) {
              values[key] = data[key as VideoPlayerStateValueKeys]!;
            }
          });
        },
        reset: (): void => {
          set((draft: WritableDraft<VideoPlayerStore>): void => {
            draft.state = initialState;
          });
        },
      },
    })),
  );
}
