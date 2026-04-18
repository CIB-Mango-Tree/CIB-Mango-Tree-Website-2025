import { useEffect, useState } from "react";

export function usingMobilePointer(): boolean {
  const [isMobilePointer, setMobilePointer] = useState<boolean>(false);

  useEffect((): void => {
    setMobilePointer(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return isMobilePointer;
}
