import { useState } from 'react';
import type { ReactElement } from 'react';

interface Tool {
  id: string;
  name: string;
  icon: ReactElement;
  description: string;
}

// Document icon (copy pasta)
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 12H17M7 16H17M7 8H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Hashtag icon
const HashtagIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9H20M4 15H20M10 3L8 21M16 3L14 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Gear icon (more coming soon)
const GearIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Chevron right icon
const ChevronRight = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const tools: Tool[] = [
  {
    id: 'copypasta',
    name: 'Copy Pasta Test',
    icon: <DocumentIcon />,
    description: 'This test looks for repeated phrases—"copypasta"—that appears across posts in your dataset. Some coordinated campaigns may consist of bot accounts reposting the same phrases to cut down on time. Our test extracts these repeated phrases, and reveals which accounts posted them, and when, in order to reveal hidden networks.'
  },
  {
    id: 'hashtag',
    name: 'Hashtag Test',
    icon: <HashtagIcon />,
    description: 'The Hashtag Test analyzes hashtag usage patterns across your dataset to identify coordinated behavior. It detects unusual hashtag clustering, timing patterns, and account associations that may indicate inauthentic coordination. This helps reveal networks that use hashtags strategically to amplify messages.'
  },
  {
    id: 'coming-soon',
    name: 'More Coming Soon!',
    icon: <GearIcon />,
    description: 'We are continuously developing new tools to help detect coordinated inauthentic behavior. Stay tuned for additional tests and features that will help you analyze social media datasets more effectively.'
  }
];

export default function ToolsSelector() {
  const [selectedTool, setSelectedTool] = useState<string>('copypasta');
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const selectedToolData = tools.find(tool => tool.id === selectedTool) || tools[0];

  return (
    <div className="mt-12">
      {/* Section Title */}
      <h3 
        className="text-2xl md:text-3xl mb-6"
        style={{ 
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
          color: '#2D3A24'
        }}
      >
        Methodologies
      </h3>

      {/* Main Container */}
      <div className="flex flex-col md:flex-row gap-0">
        {/* Left Navigation */}
        <div 
          className="w-full md:w-72 border flex-shrink-0"
          style={{ borderColor: '#E5E2DC' }}
        >
          {/* Navigation Label */}
          <div 
            className="px-5 py-3 text-xs font-bold tracking-widest"
            style={{ 
              backgroundColor: '#F8F6F2',
              borderBottom: '1px solid #E5E2DC',
              color: '#7A8872'
            }}
          >
            SELECT A METHOD
          </div>

          {/* Navigation Items */}
          {tools.map((tool) => {
            const isSelected = tool.id === selectedTool;
            const isHovered = tool.id === hoveredTool;
            const isComingSoon = tool.id === 'coming-soon';
            
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 group"
                style={{
                  backgroundColor: isSelected ? '#5A8A4A' : (isHovered ? '#F0F4EC' : '#FDFCF9'),
                  borderLeft: isSelected ? '4px solid #FFE099' : (isHovered ? '4px solid #8BBF72' : '4px solid transparent'),
                  borderBottom: !isSelected ? '1px solid #E5E2DC' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isHovered && !isSelected ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                <div 
                  className="flex items-center gap-3"
                  style={{
                    transition: 'transform 0.25s ease',
                  }}
                >
                  <span 
                    style={{ 
                      color: isSelected ? '#FFFFFF' : (isComingSoon ? '#7A8872' : '#5A6B52'),
                      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      display: 'inline-block',
                      transform: isHovered && !isSelected ? 'scale(1.2) rotate(-5deg)' : 'scale(1)',
                    }}
                  >
                    {tool.icon}
                  </span>
                  <span 
                    className="font-medium text-left"
                    style={{ 
                      color: isSelected ? '#FFFFFF' : (isHovered ? '#2D3A24' : (isComingSoon ? '#7A8872' : '#5A6B52')),
                      fontSize: '15px',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {tool.name}
                  </span>
                </div>
                <ChevronRight 
                  className="flex-shrink-0"
                  style={{ 
                    color: isSelected ? '#FFFFFF' : (isComingSoon ? '#7A8872' : '#5A8A4A'),
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isHovered || isSelected ? 'translateX(4px)' : 'translateX(0)',
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
            backgroundColor: '#F8F6F2',
            borderColor: '#E5E2DC',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Animated background accent */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: '#5A8A4A',
              transform: 'scaleY(1)',
              transition: 'transform 0.3s ease',
            }}
          />
          
          {/* Content Title */}
          <h4 
            className="text-xl mb-4"
            style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              color: '#5A8A4A',
              letterSpacing: '-0.01em',
              animation: 'fadeSlideIn 0.3s ease',
            }}
            key={selectedToolData.id + '-title'}
          >
            {selectedToolData.name}
          </h4>
          
          {/* Content Description */}
          <p 
            className="leading-relaxed"
            style={{ 
              color: '#5A6B52',
              fontSize: '15px',
              lineHeight: '1.7',
              animation: 'fadeSlideIn 0.3s ease 0.1s both',
            }}
            key={selectedToolData.id + '-desc'}
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
