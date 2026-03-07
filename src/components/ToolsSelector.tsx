import { FileText, Hash, Settings, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import type { FC, ReactElement } from "react";

export interface Tool {
  id: string;
  name: string;
  icon: "file-text" | "hash" | "settings";
  description: string;
}

export interface ToolSelectorProps {
  tools: Array<Tool>;
}

export const TOOLS: Array<Tool> = [
  {
    id: "copypasta",
    name: "Copy Pasta Test",
    icon: "file-text",
    description:
      'This test looks for repeated phrases—"copypasta"—that appears across posts in your dataset. Some coordinated campaigns may consist of bot accounts reposting the same phrases to cut down on time. Our test extracts these repeated phrases, and reveals which accounts posted them, and when, in order to reveal hidden networks.',
  },
  {
    id: "hashtag",
    name: "Hashtag Test",
    icon: "hash",
    description:
      "The Hashtag Test analyzes hashtag usage patterns across your dataset to identify coordinated behavior. It detects unusual hashtag clustering, timing patterns, and account associations that may indicate inauthentic coordination. This helps reveal networks that use hashtags strategically to amplify messages.",
  },
  {
    id: "coming-soon",
    name: "More Coming Soon!",
    icon: "settings",
    description:
      "We are continuously developing new tools to help detect coordinated inauthentic behavior. Stay tuned for additional tests and features that will help you analyze social media datasets more effectively.",
  },
];

const iconMap: Record<string, ReactElement<FC>> = {
  "file-text": <FileText className="size-6" />,
  hash: <Hash className="size-6" />,
  settings: <Settings className="size-6" />,
};

export default function ToolsSelector({
  tools,
}: ToolSelectorProps): ReactElement<FC> {
  return (
    <Tabs orientation="vertical" className="flex-col mx-6 md:flex-row lg:mx-0 border border-[#E5E2DC] gap-0">
      <div className="flex flex-col shrink-0 w-full md:w-72">
        <div className="flex px-5 py-3 bg-[#F8F6F2] border-b border-b-[#E5E2DC]">
          <span className="text-xs text-[#7A8872] font-bold tracking-widest">
            SELECT A METHOD
          </span>
        </div>
        <TabsList
          variant="line"
          className="rounded-none bg-white p-0 w-full gap-0 overflow-x-hidden"
        >
          {tools.map((tool: Tool): ReactElement<FC> => {
            return (
              <TabsTrigger
                key={tool.id}
                value={tool.id}
                className="group-data-vertical/tabs:justify-between cursor-pointer w-full gap-3 px-5 py-4 rounded-none h-auto border-l-4 border-l-transparent border-b border-b-[#E5E2DC] border-t-0 border-r-0 text-[#5A6B52] transition-all duration-250 ease-default bg-white! group/trigger not-data-active:hover:bg-[#F0F4EC]! not-data-active:hover:text-[#2D3A24] not-data-active:hover:translate-x-1 not-data-active:hover:border-l-[#8BBF72] data-active:bg-mango-green-dark! data-active:border-l-[#FFE099] data-active:border-b-transparent data-active:translate-x-0 data-active:shadow-none! after:hidden!"
              >
                <div className="flex flex-row items-center gap-3">
                  <span className="inline-flex transition-transform duration-300 ease-default group-data-active/trigger:text-white data-[state=active]:text-white not-group-data-active/trigger:group-hover/trigger:scale-120 not-group-data-active/trigger:group-hover/trigger:-rotate-[5deg] data-active:scale-100 data-active:rotate-0">
                    {iconMap[tool.icon]}
                  </span>
                  <span className="font-medium text-left text-base group-data-active/trigger:text-white">
                    {tool.name}
                  </span>
                </div>
                <span className="shrink-0 text-mango-green-dark transition-transform duration-250 ease-default group-data-active/trigger:text-white">
                  <ChevronRight />
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      <div className="flex flex-1 w-full relative h-64 border-l-4 border-l-mango-green-dark bg-[#F8F6F2] ">
        {tools.map((tool: Tool): ReactElement<FC> => {
          return (
            <TabsContent
              key={tool.name}
              value={tool.id}
              className="flex flex-col p-8 animate-fade-in-accordion overflow-y-auto h-full"
            >
              <h4 className="text-xl mb-4 font-bold text-mango-green-dark tracking-tight">
                {tool.name}
              </h4>
              <p className="leading-relaxed max-w-md text-[#5A6B52] text-4">
                {tool.description}
              </p>
            </TabsContent>
          );
        })}
      </div>
    </Tabs>
  );
}
