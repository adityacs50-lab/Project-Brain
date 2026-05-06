import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeStyles = {
  active: { background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', padding: '12px' },
  pending: { background: '#EAB308', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)' },
  conflict: { background: '#EF4444', color: 'white', border: '2px solid #B91C1C', borderRadius: '8px', padding: '12px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' },
  archived: { background: '#3F3F46', color: '#A1A1AA', border: 'none', borderRadius: '8px', padding: '12px', opacity: 0.6 }
};

const LogicGraph = () => {
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://project-brain-production-fa75.up.railway.app';

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/graph`);
        const data = await response.json();
        
        // Conflict Detection Logic
        const titleCounts = {};
        data.nodes.forEach(n => {
          titleCounts[n.label] = (titleCounts[n.label] || 0) + 1;
        });

        // Transform nodes for ReactFlow
        const rfNodes = data.nodes.map((n, i) => {
          const isConflict = titleCounts[n.label] > 1;
          const status = isConflict ? 'conflict' : n.status;

          return {
            id: n.id,
            data: { label: (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{n.label}</div>
                {isConflict && <div style={{ fontSize: '8px', fontWeight: 'bold', marginTop: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>CONFLICT</div>}
                <div style={{ fontSize: '10px', marginTop: '4px', textTransform: 'uppercase', opacity: 0.7 }}>{n.type}</div>
              </div>
            ) },
            position: { x: (i % 3) * 250, y: Math.floor(i / 3) * 150 },
            style: nodeStyles[status] || nodeStyles.active
          };
        });

        // Transform edges for ReactFlow
        const rfEdges = data.edges.map((e, i) => ({
          id: `e-${i}`,
          source: e.from,
          target: e.to,
          label: e.type,
          animated: e.type === 'requires',
          markerEnd: { type: 'arrowclosed', color: '#94a3b8' },
          style: { stroke: '#94a3b8', strokeWidth: 2 }
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
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Building Knowledge Map...</div>;

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: '#fcfcfb' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default LogicGraph;
