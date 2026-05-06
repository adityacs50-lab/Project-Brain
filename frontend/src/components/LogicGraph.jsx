import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeStyles = {
  active: { background: '#dcfce7', border: '1px solid #16a34a', borderRadius: '8px', padding: '10px' },
  pending: { background: '#fef9c3', border: '1px solid #ca8a04', borderRadius: '8px', padding: '10px', boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)' },
  archived: { background: '#f3f4f6', border: '1px solid #4b5563', borderRadius: '8px', padding: '10px', opacity: 0.6 }
};

const LogicGraph = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch('http://localhost:8000/graph');
        const data = await response.json();
        
        // Transform nodes for ReactFlow
        const rfNodes = data.nodes.map((n, i) => ({
          id: n.id,
          data: { label: (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{n.label}</div>
              <div style={{ fontSize: '10px', marginTop: '4px', textTransform: 'uppercase', opacity: 0.7 }}>{n.type}</div>
            </div>
          ) },
          position: { x: (i % 3) * 250, y: Math.floor(i / 3) * 150 },
          style: nodeStyles[n.status] || nodeStyles.active
        }));

        // Transform edges for ReactFlow
        const rfEdges = data.edges.map((e, i) => ({
          id: `e-${i}`,
          source: e.from,
          target: e.to,
          label: e.type,
          animated: e.type === 'requires',
          style: { stroke: '#94a3b8' }
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
