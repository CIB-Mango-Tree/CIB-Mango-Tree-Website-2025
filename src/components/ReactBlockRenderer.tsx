import { RichText } from "@payloadcms/richtext-lexical/react";
import { cn } from "@utils/classMerge";
import type { ReactElement, FC, ReactNode, ElementType } from "react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";

export interface BlockRendererProps {
  data: SerializedEditorState;
}

const headingClasses: Record<string, string> = {
  h1: "font-bold text-3xl md:text-4xl text-mango-green-dark mt-8 mb-4 first:mt-0",
  h2: "font-bold text-2xl md:text-3xl text-mango-green-dark mt-8 mb-4 first:mt-0",
  h3: "font-bold text-xl md:text-2xl text-mango-green-darker mt-6 mb-3 first:mt-0",
  h4: "font-semibold text-lg text-mango-green-darker mt-6 mb-2 first:mt-0",
  h5: "font-semibold text-base text-mango-green-darker mt-4 mb-2 first:mt-0",
  h6: "font-semibold text-sm uppercase tracking-wider text-muted mt-4 mb-2 first:mt-0",
};

const linkClasses: string =
  "text-mango-green-dark underline underline-offset-3 transition-colors transform-gpu duration-200 ease-linear hover:text-mango-green-darkest";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => {
    const children: Array<ReactNode> = nodesToJSX({ nodes: node.children });

    if (children.length === 0) return <></>;

    return (
      <p className="text-foreground leading-relaxed mb-4 last:mb-0">
        {children}
      </p>
    );
  },
  heading: ({ node, nodesToJSX }) => {
    const children: Array<ReactNode> = nodesToJSX({ nodes: node.children });
    const tag: string = headingClasses[node.tag] != null ? node.tag : "h1";
    const Tag: ElementType = tag as ElementType;

    return <Tag className={headingClasses[tag]}>{children}</Tag>;
  },
  list: ({ node, nodesToJSX }) => {
    const children: Array<ReactNode> = nodesToJSX({ nodes: node.children });
    const Tag: "ol" | "ul" = node.tag === "ol" ? "ol" : "ul";
    const listClasses: string = cn(
      "pl-6 mb-4 space-y-1 text-foreground marker:text-mango-green-dark",
      Tag === "ol" ? "list-decimal" : "list-disc",
    );

    return <Tag className={listClasses}>{children}</Tag>;
  },
  listitem: ({ node, nodesToJSX }) => {
    const children: Array<ReactNode> = nodesToJSX({ nodes: node.children });

    return <li className="leading-relaxed">{children}</li>;
  },
  quote: ({ node, nodesToJSX }) => {
    const children: Array<ReactNode> = nodesToJSX({ nodes: node.children });

    return (
      <blockquote className="border-l-4 border-mango-green-light bg-background-alt/40 pl-4 py-2 my-6 text-muted italic">
        {children}
      </blockquote>
    );
  },
  link: ({ node, nodesToJSX }) => {
    const children: Array<ReactNode> = nodesToJSX({ nodes: node.children });
    const newTab: boolean = node.fields.newTab === true;

    return (
      <a
        href={node.fields.url ?? "#"}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={linkClasses}
      >
        {children}
      </a>
    );
  },
  autolink: ({ node, nodesToJSX }) => {
    const children: Array<ReactNode> = nodesToJSX({ nodes: node.children });
    const newTab: boolean = node.fields.newTab === true;

    return (
      <a
        href={node.fields.url ?? "#"}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={linkClasses}
      >
        {children}
      </a>
    );
  },
  upload: ({ node }) => {
    const uploadNode: any = node;

    if (typeof uploadNode.value !== "object" || uploadNode.value == null)
      return null;

    const uploadDoc: any = uploadNode.value;
    const alt: string = uploadNode.fields?.alt ?? uploadDoc?.alt ?? "";
    const url: string = uploadDoc.url ?? "";

    if (
      typeof uploadDoc.mimeType !== "string" ||
      !uploadDoc.mimeType.startsWith("image")
    )
      return (
        <a href={url} rel="noopener noreferrer" className={linkClasses}>
          {uploadDoc.filename}
        </a>
      );

    return (
      <img
        src={url}
        alt={alt}
        width={uploadDoc.width ?? undefined}
        height={uploadDoc.height ?? undefined}
        loading="lazy"
        className="my-6 max-w-full h-auto"
      />
    );
  },
  horizontalrule: () => (
    <hr className="my-8 border-0 border-t border-border" />
  ),
});

export function BlockRenderer({
  data,
}: BlockRendererProps): ReactElement<FC> {
  return <RichText data={data} disableContainer converters={converters} />;
}
