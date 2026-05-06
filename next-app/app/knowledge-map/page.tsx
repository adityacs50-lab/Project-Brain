"use client";

import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeStyles = {
  active: { background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', padding: '12px' },
  pending: { background: '#EAB308', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)' },
  archived: { background: '#3F3F46', color: '#A1A1AA', border: 'none', borderRadius: '8px', padding: '12px', opacity: 0.6 }
};

export default function KnowledgeMapPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://project-brain-production-fa75.up.railway.app';

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/graph`);
        const data = await response.json();
        
        const rfNodes = data.nodes.map((n: any, i: number) => ({
          id: n.id,
          data: { label: (
            <div className="text-center">
              <div className="font-bold text-xs">{n.label}</div>
              <div className="text-[9px] mt-1 uppercase opacity-80">{n.type}</div>
            </div>
          ) },
          position: { x: (i % 3) * 280, y: Math.floor(i / 3) * 180 },
          style: nodeStyles[n.status as keyof typeof nodeStyles] || nodeStyles.active
        }));

        const rfEdges = data.edges.map((e: any, i: number) => ({
          id: `e-${i}`,
          source: e.from,
          target: e.to,
          label: e.type,
          animated: e.type === 'requires',
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
  }, [API_BASE_URL]);

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
