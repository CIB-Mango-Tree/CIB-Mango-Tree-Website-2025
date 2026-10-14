import { Download } from "lucide-react";
import { baseButtonVariants } from "@lib/variants/button";
import { resolveClasses } from "@utils/classMerge";
import type { FC, MouseEvent, ReactElement } from "react";
import type { LinkButtons } from "@lib/types/payload-types";

type LinkButtonItem = NonNullable<LinkButtons["items"]>[number];

export interface DemoDataDownloadProps {
  href: string;
  label: string;
  variant?: LinkButtonItem["type"];
  hoverAnimation?: boolean;
}

export default function DemoDataDownload({
  href,
  label,
  variant = "gold",
  hoverAnimation = true,
}: DemoDataDownloadProps): ReactElement<FC> {
  const className: string = resolveClasses(
    baseButtonVariants({ variant }),
    "group",
    {
      "hover:-translate-y-0.5 active:-translate-y-px": hoverAnimation,
    },
  );

  const fileName: string =
    href.split("/").pop()?.split("?")[0] || "demo_data.csv";

  const handleClick = async (
    event: MouseEvent<HTMLAnchorElement>,
  ): Promise<void> => {
    // Cross-origin GitHub raw URLs navigate/view instead of saving.
    // The HTML download attribute also does not work cross-origin.
    // Fetch → same-origin blob URL → temporary <a download> forces a save dialog.
    event.preventDefault();

    const response = await fetch(href);
    if (!response.ok) return;

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const temporaryLink = document.createElement("a");

    temporaryLink.href = objectUrl;
    temporaryLink.download = fileName;
    temporaryLink.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      <Download className="w-5 h-5 transition-transform transform-gpu group-hover:animate-bounce" />
      {label}
    </a>
  );
}
