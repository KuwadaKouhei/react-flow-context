'use client';

import { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 50 },
    data: { label: 'ノード 1' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 150 },
    data: { label: 'ノード 2' },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 400, y: 150 },
    data: { label: 'ノード 3' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

interface ContextMenuProps {
  position: { x: number; y: number };
  nodeId?: string;
  onAddNode: (position: { x: number; y: number }) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

const ContextMenu = ({ position, nodeId, onAddNode, onDeleteNode, onClose }: ContextMenuProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        background: '#374151',
        border: '1px solid #4b5563',
        borderRadius: '6px',
        padding: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        color: 'white',
      }}
    >
      <button
        onClick={() => {
          onAddNode(position);
          onClose();
        }}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          borderRadius: '4px',
          marginBottom: '4px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#4b5563')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        ノードを追加
      </button>
      {nodeId && (
        <button
          onClick={() => {
            onDeleteNode(nodeId);
            onClose();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#4b5563')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          ノードを削除
        </button>
      )}
    </div>
  );
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    position: { x: number; y: number };
    nodeId?: string;
  }>({ show: false, position: { x: 0, y: 0 } });
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        show: true,
        position: { x: event.clientX, y: event.clientY },
        nodeId: node.id,
      });
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const clientX = 'clientX' in event ? event.clientX : (event as MouseEvent).clientX;
      const clientY = 'clientY' in event ? event.clientY : (event as MouseEvent).clientY;
      setContextMenu({
        show: true,
        position: { x: clientX, y: clientY },
      });
    },
    []
  );

  const onAddNode = useCallback(
    (position: { x: number; y: number }) => {
      const newNodeId = `node_${Date.now()}`;
      const newNode: Node = {
        id: newNodeId,
        type: 'default',
        position: { x: position.x - 100, y: position.y - 50 },
        data: { label: `新しいノード ${nodes.length + 1}` },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes.length, setNodes]
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const onCloseContextMenu = useCallback(() => {
    setContextMenu({ show: false, position: { x: 0, y: 0 } });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111827' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onCloseContextMenu}
        colorMode="dark"
        style={{ background: '#111827' }}
      >
        <Controls />
        <MiniMap
          style={{ background: '#1f2937' }}
          nodeColor="#6366f1"
          maskColor="rgba(0, 0, 0, 0.3)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color="#374151"
        />
      </ReactFlow>
      {contextMenu.show && (
        <ContextMenu
          position={contextMenu.position}
          nodeId={contextMenu.nodeId}
          onAddNode={onAddNode}
          onDeleteNode={onDeleteNode}
          onClose={onCloseContextMenu}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
