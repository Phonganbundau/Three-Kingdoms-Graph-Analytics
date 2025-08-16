"use client";
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

const NetworkGraph = ({ nodes, edges }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !nodes || !edges) return;

    // Convert data to vis-network format
    const visNodes = nodes.map(node => ({
      id: node.id,
      label: node.name || node.label || `Node ${node.id}`,
      group: node.faction || 'default',
      color: node.color || '#666',
      title: node.name || node.label || `Node ${node.id}`
    }));

    const visEdges = edges.map(edge => ({
      from: edge.from || edge.start || edge.source,
      to: edge.to || edge.end || edge.target,
      label: edge.label || edge.type || '',
      arrows: 'to',
      smooth: { type: 'continuous' }
    }));

    // Network options
    const options = {
      nodes: {
        shape: 'circle',
        size: 20,
        font: {
          size: 12,
          color: '#333'
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        color: { color: '#848484', highlight: '#848484', hover: '#848484' },
        smooth: { type: 'continuous' },
        font: {
          size: 10,
          color: '#666'
        }
      },
      physics: {
        stabilization: false,
        barnesHut: {
          gravitationalConstant: -80000,
          springConstant: 0.001,
          springLength: 200
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200
      }
    };

    // Create network
    const network = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, options);
    networkRef.current = network;

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [nodes, edges]);

  return (
    <div className="w-full h-full min-h-[600px] border border-gray-200 rounded-lg">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default NetworkGraph;