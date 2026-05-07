"use client";

import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, MarkerType, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeStyles = {
  active: { background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', padding: '12px' },
  pending: { background: '#EAB308', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)' },
  conflict: { background: '#EF4444', color: 'white', border: '2px solid #B91C1C', borderRadius: '8px', padding: '12px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' },
  archived: { background: '#3F3F46', color: '#A1A1AA', border: 'none', borderRadius: '8px', padding: '12px', opacity: 0.6 }
};

interface GraphNode {
  id: string;
  label: string;
  status: string;
  type: string;
  has_conflict: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

export default function KnowledgeMapPage() {
  const workspaceId = "T0B27A94NN4";
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://project-brain-production-fa75.up.railway.app';

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/graph?workspace_id=${workspaceId}`);
        const data = await response.json();
        
        // Transform nodes using backend deterministic truth
        const rfNodes: Node[] = data.nodes.map((n: GraphNode, i: number) => {
          const isConflict = n.has_conflict;
          const status = isConflict ? 'conflict' : n.status;

          return {
            id: n.id,
            data: { label: (
              <div className="text-center">
                <div className="font-bold text-xs">{n.label}</div>
                {isConflict && <div className="text-[8px] font-black tracking-tighter mt-1 bg-white/20 px-1 rounded">CONFLICT DETECTED</div>}
                <div className="text-[9px] mt-1 uppercase opacity-80">{n.type}</div>
              </div>
            ) },
            position: { x: (i % 3) * 280, y: Math.floor(i / 3) * 180 },
            style: nodeStyles[status as keyof typeof nodeStyles] || nodeStyles.active
          };
        });

        // Get a set of all valid node IDs for validation
        const validNodeIds = new Set(rfNodes.map((n: Node) => n.id));

        const rfEdges = data.edges
          .filter((e: GraphEdge) => {
            const hasSource = validNodeIds.has(e.from);
            const hasTarget = validNodeIds.has(e.to);
            return hasSource && hasTarget;
          })
          .map((e: GraphEdge, i: number) => ({
            id: `e-${i}`,
            source: e.from,
            target: e.to,
            label: e.type,
            animated: e.type === 'requires',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#4B5563',
            },
            style: { stroke: '#4B5563', strokeWidth: 2 }
          }));

        setNodes(rfNodes);
        setEdges(rfEdges);
      } catch (err) {
        console.error("Failed to fetch graph:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [API_BASE_URL, workspaceId]);

  return (
    <div className="space-y-6 h-[calc(100vh-160px)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Knowledge Map</h1>
        <p className="text-zinc-500">The Living Operating System: Visualizing institutional memory and rule dependencies.</p>
      </div>

      <div className="h-full w-full rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex h-full items-center justify-center text-zinc-400 animate-pulse">
            Synthesizing Knowledge Graph...
          </div>
        ) : (
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background color="#F4F4F5" gap={20} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
