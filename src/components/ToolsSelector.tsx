import { useState } from "react";
import type { ReactElement } from "react";
import { FileText, Hash, Settings, ChevronRight } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  icon: ReactElement;
  description: string;
}

const tools: Tool[] = [
  {
    id: "copypasta",
    name: "Copy Pasta Test",
    icon: <FileText size={20} />,
    description:
      'This test looks for repeated phrases—"copypasta"—that appears across posts in your dataset. Some coordinated campaigns may consist of bot accounts reposting the same phrases to cut down on time. Our test extracts these repeated phrases, and reveals which accounts posted them, and when, in order to reveal hidden networks.',
  },
  {
    id: "hashtag",
    name: "Hashtag Test",
    icon: <Hash size={20} />,
    description:
      "The Hashtag Test analyzes hashtag usage patterns across your dataset to identify coordinated behavior. It detects unusual hashtag clustering, timing patterns, and account associations that may indicate inauthentic coordination. This helps reveal networks that use hashtags strategically to amplify messages.",
  },
  {
    id: "coming-soon",
    name: "More Coming Soon!",
    icon: <Settings size={20} />,
    description:
      "We are continuously developing new tools to help detect coordinated inauthentic behavior. Stay tuned for additional tests and features that will help you analyze social media datasets more effectively.",
  },
];

export default function ToolsSelector() {
  const [selectedTool, setSelectedTool] = useState<string>("copypasta");
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const selectedToolData =
    tools.find((tool) => tool.id === selectedTool) || tools[0];

  return (
    <div className="mt-12 max-w-4xl mx-auto">
      {/* Section Title */}
      <h3 className="font-bold text-2xl md:text-3xl mb-6">Methodologies</h3>

      {/* Main Container */}
      <div className="flex flex-col md:flex-row gap-0">
        {/* Left Navigation */}
        <div
          className="w-full md:w-72 border shrink-0"
          style={{ borderColor: "#E5E2DC" }}
        >
          {/* Navigation Label */}
          <div
            className="px-5 py-3 text-xs font-bold tracking-widest"
            style={{
              backgroundColor: "#F8F6F2",
              borderBottom: "1px solid #E5E2DC",
              color: "#7A8872",
            }}
          >
            SELECT A METHOD
          </div>

          {/* Navigation Items */}
          {tools.map((tool) => {
            const isSelected = tool.id === selectedTool;
            const isHovered = tool.id === hoveredTool;
            const isComingSoon = tool.id === "coming-soon";

            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 group"
                style={{
                  backgroundColor: isSelected
                    ? "#5A8A4A"
                    : isHovered
                      ? "#F0F4EC"
                      : "#FDFCF9",
                  borderLeft: isSelected
                    ? "4px solid #FFE099"
                    : isHovered
                      ? "4px solid #8BBF72"
                      : "4px solid transparent",
                  borderBottom: !isSelected ? "1px solid #E5E2DC" : "none",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform:
                    isHovered && !isSelected
                      ? "translateX(4px)"
                      : "translateX(0)",
                }}
              >
                <div
                  className="flex items-center gap-3"
                  style={{
                    transition: "transform 0.25s ease",
                  }}
                >
                  <span
                    style={{
                      color: isSelected
                        ? "#FFFFFF"
                        : isComingSoon
                          ? "#7A8872"
                          : "#5A6B52",
                      transition:
                        "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      display: "inline-block",
                      transform:
                        isHovered && !isSelected
                          ? "scale(1.2) rotate(-5deg)"
                          : "scale(1)",
                    }}
                  >
                    {tool.icon}
                  </span>
                  <span
                    className="font-medium text-left"
                    style={{
                      color: isSelected
                        ? "#FFFFFF"
                        : isHovered
                          ? "#2D3A24"
                          : isComingSoon
                            ? "#7A8872"
                            : "#5A6B52",
                      fontSize: "15px",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {tool.name}
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0"
                  style={{
                    color: isSelected
                      ? "#FFFFFF"
                      : isComingSoon
                        ? "#7A8872"
                        : "#5A8A4A",
                    transition:
                      "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform:
                      isHovered || isSelected
                        ? "translateX(4px)"
                        : "translateX(0)",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div
          className="flex-1 p-8 border border-l-0 relative overflow-hidden"
          style={{
            backgroundColor: "#F8F6F2",
            borderColor: "#E5E2DC",
            transition: "all 0.3s ease",
          }}
        >
          {/* Animated background accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "100%",
              backgroundColor: "#5A8A4A",
              transform: "scaleY(1)",
              transition: "transform 0.3s ease",
            }}
          />

          {/* Content Title */}
          <h4
            className="text-xl mb-4"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              color: "#5A8A4A",
              letterSpacing: "-0.01em",
              animation: "fadeSlideIn 0.3s ease",
            }}
            key={selectedToolData.id + "-title"}
          >
            {selectedToolData.name}
          </h4>

          {/* Content Description */}
          <p
            className="leading-relaxed max-w-md"
            style={{
              color: "#5A6B52",
              fontSize: "15px",
              lineHeight: "1.7",
              animation: "fadeSlideIn 0.3s ease 0.1s both",
            }}
            key={selectedToolData.id + "-desc"}
          >
            {selectedToolData.description}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
