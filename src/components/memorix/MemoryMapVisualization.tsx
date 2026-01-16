import { useState, useEffect, useRef, useMemo } from "react";
import {
  FileText,
  Mic,
  Video,
  Link as LinkIcon,
  Brain,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MemoryNode {
  id: string;
  name: string;
  type: "pdf" | "doc" | "audio" | "video" | "url" | "concept";
  x: number;
  y: number;
  connections: string[];
  metadata?: {
    keyPoints?: string[];
    entities?: {
      names?: string[];
      dates?: string[];
    };
  };
}

interface MemoryMapVisualizationProps {
  sources: Array<{
    id: string;
    name: string;
    type: string;
    metadata?: Record<string, unknown>;
  }>;
  className?: string;
}

export const MemoryMapVisualization = ({
  sources,
  className,
}: MemoryMapVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Generate nodes with positions in a circular layout
  const nodes = useMemo<MemoryNode[]>(() => {
    const centerX = 250;
    const centerY = 200;
    const radius = 150;

    // Create central brain node
    const centralNode: MemoryNode = {
      id: "central",
      name: "Knowledge Hub",
      type: "concept",
      x: centerX,
      y: centerY,
      connections: sources.map((s) => s.id),
    };

    // Position source nodes in a circle
    const sourceNodes: MemoryNode[] = sources.map((source, index) => {
      const angle = (index / sources.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: source.id,
        name: source.name,
        type: source.type as MemoryNode["type"],
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        connections: ["central"],
        metadata: source.metadata as MemoryNode["metadata"],
      };
    });

    // Add connections between related nodes (based on shared entities)
    sourceNodes.forEach((node, i) => {
      sourceNodes.forEach((other, j) => {
        if (i !== j && Math.random() > 0.7) {
          // Random connections for demo
          if (!node.connections.includes(other.id)) {
            node.connections.push(other.id);
          }
        }
      });
    });

    return [centralNode, ...sourceNodes];
  }, [sources]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "doc":
        return FileText;
      case "audio":
        return Mic;
      case "video":
        return Video;
      case "url":
        return LinkIcon;
      case "concept":
        return Brain;
      default:
        return FileText;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-500/20 border-red-500/50 text-red-500";
      case "doc":
        return "bg-blue-500/20 border-blue-500/50 text-blue-500";
      case "audio":
        return "bg-purple-500/20 border-purple-500/50 text-purple-500";
      case "video":
        return "bg-green-500/20 border-green-500/50 text-green-500";
      case "url":
        return "bg-orange-500/20 border-orange-500/50 text-orange-500";
      case "concept":
        return "bg-primary/20 border-primary/50 text-primary";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).closest(".map-canvas")) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Draw connections between nodes
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    const drawnConnections = new Set<string>();

    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const connectionKey = [node.id, targetId].sort().join("-");
        if (drawnConnections.has(connectionKey)) return;
        drawnConnections.add(connectionKey);

        const target = nodes.find((n) => n.id === targetId);
        if (!target) return;

        const isHighlighted =
          hoveredNode === node.id ||
          hoveredNode === targetId ||
          selectedNode === node.id ||
          selectedNode === targetId;

        connections.push(
          <line
            key={connectionKey}
            x1={node.x}
            y1={node.y}
            x2={target.x}
            y2={target.y}
            stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"}
            strokeWidth={isHighlighted ? 2 : 1}
            strokeOpacity={isHighlighted ? 0.8 : 0.3}
            className="transition-all duration-300"
          />
        );
      });
    });

    return connections;
  };

  if (sources.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-muted-foreground", className)}>
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Upload sources to visualize your knowledge map</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-card/50", className)}>
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleZoom(0.1)}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleZoom(-0.1)}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Canvas */}
      <div
        ref={containerRef}
        className="map-canvas h-80 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 500 400"
          style={{
            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* Connections */}
          <g>{renderConnections()}</g>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const size = node.type === "concept" ? 40 : 32;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow effect for selected/hovered */}
                {(isSelected || isHovered) && (
                  <circle
                    r={size / 2 + 8}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                    className="animate-pulse"
                  />
                )}

                {/* Node circle */}
                <circle
                  r={size / 2}
                  className={cn(
                    "transition-all duration-300",
                    isSelected || isHovered ? "fill-primary/30" : "fill-background"
                  )}
                  stroke={isSelected || isHovered ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth="2"
                />

                {/* Icon */}
                <foreignObject
                  x={-size / 4}
                  y={-size / 4}
                  width={size / 2}
                  height={size / 2}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      className={cn(
                        "transition-colors",
                        node.type === "concept" ? "h-4 w-4" : "h-3 w-3",
                        isSelected || isHovered ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                </foreignObject>

                {/* Label */}
                <text
                  y={size / 2 + 14}
                  textAnchor="middle"
                  className={cn(
                    "text-[9px] font-medium transition-colors",
                    isSelected || isHovered ? "fill-foreground" : "fill-muted-foreground"
                  )}
                >
                  {node.name.length > 15 ? node.name.slice(0, 15) + "..." : node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-background/95 border border-border backdrop-blur-sm">
          {(() => {
            const node = nodes.find((n) => n.id === selectedNode);
            if (!node) return null;
            const Icon = getNodeIcon(node.type);
            return (
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getNodeColor(node.type))}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{node.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connected to {node.connections.length} node{node.connections.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
