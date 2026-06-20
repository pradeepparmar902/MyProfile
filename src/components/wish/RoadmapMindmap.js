"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Save, X, Loader2 } from 'lucide-react';
import MindmapNode from './MindmapNode';

const nodeTypes = {
  mindmap: MindmapNode,
};

// Initial layout settings
const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;
const X_OFFSET = 250;
const Y_OFFSET = 80;

function MindmapCanvas({ wish, onClose, onSave }) {
  const { project, getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const [isSaving, setIsSaving] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const reactFlowWrapper = useRef(null);

  // Initialize nodes and edges from wish.mindmapData or use defaults
  const initialData = wish.mindmapData ? (typeof wish.mindmapData === 'string' ? JSON.parse(wish.mindmapData) : wish.mindmapData) : null;
  
  const [nodes, , onNodesChange] = useNodesState(
    initialData?.nodes || [
      {
        id: 'root',
        type: 'mindmap',
        position: { x: 100, y: 300 },
        data: { label: wish.title, isRoot: true, color: '#3b82f6', status: 'In Progress', notes: '' },
      },
    ]
  );
  
  const [edges, , onEdgesChange] = useEdgesState(initialData?.edges || []);

  // Callbacks are defined below

  const onLabelChange = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n))
    );
  }, [setNodes]);

  const onColorChange = useCallback((id, newColor) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, color: newColor } } : n))
    );
    // Update connected edges to match color
    setEdges((eds) =>
      eds.map((e) => (e.source === id ? { ...e, style: { stroke: newColor, strokeWidth: 3 } } : e))
    );
  }, [setNodes, setEdges]);

  const deleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (activeNodeId === id) setActiveNodeId(null);
  }, [setNodes, setEdges, activeNodeId]);

  const onConnect = useCallback((params) => {
    // Determine color based on source node
    const sourceNode = getNodes().find(n => n.id === params.source);
    const color = sourceNode?.data?.color || '#3b82f6';
    
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep', 
      animated: true, 
      style: { stroke: color, strokeWidth: 3 } 
    }, eds));
  }, [setEdges, getNodes]);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, [setEdges]);

  const onMoreInfo = useCallback((id) => {
    setActiveNodeId(id);
  }, []);

  const updateNodeData = useCallback((id, key, value) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n))
    );
  }, [setNodes]);

  // Find the lowest Y position among children to place the new node below them
  const getChildYPosition = (sourceId, sourcePosition) => {
    const childEdges = getEdges().filter(e => e.source === sourceId);
    if (childEdges.length === 0) return sourcePosition.y;
    
    const childNodes = getNodes().filter(n => childEdges.some(e => e.target === n.id));
    const maxY = Math.max(...childNodes.map(n => n.position.y));
    return maxY + Y_OFFSET;
  };

  const addChildNode = useCallback((sourceId) => {
    const sourceNode = getNodes().find(n => n.id === sourceId);
    if (!sourceNode) return;

    const newNodeId = uuidv4();
    const newY = getChildYPosition(sourceId, sourceNode.position);
    
    const newNode = {
      id: newNodeId,
      type: 'mindmap',
      position: { x: sourceNode.position.x + X_OFFSET, y: newY },
      data: { 
        label: 'New Node', 
        color: sourceNode.data.color,
        onLabelChange,
        onColorChange,
        onDelete: deleteNode,
        onAddChild: addChildNode,
        onAddSibling: addSiblingNode,
      },
    };

    const newEdge = {
      id: `e-${sourceId}-${newNodeId}`,
      source: sourceId,
      target: newNodeId,
      type: 'smoothstep',
      style: { stroke: sourceNode.data.color, strokeWidth: 3 },
      animated: true,
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    
    // Select the new node so user can start typing
    setTimeout(() => {
      setNodes((nds) => nds.map(n => ({ ...n, selected: n.id === newNodeId })));
    }, 50);
  }, [getNodes, getEdges, setNodes, setEdges]);

  const addSiblingNode = useCallback((nodeId) => {
    const node = getNodes().find(n => n.id === nodeId);
    if (!node || node.data.isRoot) return;

    // Find the parent by looking at edges
    const parentEdge = getEdges().find(e => e.target === nodeId);
    if (parentEdge) {
      addChildNode(parentEdge.source);
    }
  }, [getNodes, getEdges, addChildNode]);

  // Update node data dynamically (for callbacks) now that they are defined
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onLabelChange,
          onColorChange,
          onDelete: deleteNode,
          onAddChild: addChildNode,
          onAddSibling: addSiblingNode,
          onMoreInfo,
        },
      }))
    );
  }, [setNodes, onLabelChange, onColorChange, deleteNode, addChildNode, addSiblingNode, onMoreInfo]);

  // Handle Keyboard Shortcuts
  const onKeyDown = useCallback((event) => {
    const selectedNodes = getNodes().filter(n => n.selected);
    if (selectedNodes.length === 1) {
      const selectedNode = selectedNodes[0];
      
      // Ignore if user is typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.key === 'Tab') {
        event.preventDefault();
        addChildNode(selectedNode.id);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        addSiblingNode(selectedNode.id);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        if (!selectedNode.data.isRoot) {
          deleteNode(selectedNode.id);
        }
      }
    }
  }, [getNodes, addChildNode, addSiblingNode, deleteNode]);

  const handleSave = async () => {
    setIsSaving(true);
    const mindmapData = { nodes: getNodes(), edges: getEdges() };
    
    if (wish.id === 'new') {
      const res = await fetch(`/api/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: wish.title || "My Career Vision",
          mindmapData: JSON.stringify(mindmapData) 
        }),
      });
      const data = await res.json();
      if (data.wish) {
        wish.id = data.wish.id; // Update ID so future saves are PUTs
      }
    } else {
      await fetch(`/api/wishes/${wish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mindmapData: JSON.stringify(mindmapData) }),
      });
    }
    
    setIsSaving(false);
    if (onSave) onSave(mindmapData);
  };

  return (
    <div className={wish.isInline ? "w-full h-[700px] flex flex-col rounded-2xl overflow-hidden shadow-sm border border-slate-200" : "fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm"} onKeyDown={onKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white">{wish.title} Roadmap</h2>
          <p className="text-sm text-slate-400">Press Tab to add a child step, Enter to add a sibling step.</p>
        </div>
        <div className="flex gap-3">
          {!wish.isInline && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={16} /> Close
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Roadmap
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full h-full flex relative" ref={reactFlowWrapper}>
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            panOnScroll={true}
            className="bg-[#0f172a]" // Deep dark slate background
            defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          >
            <Background color="#334155" gap={24} size={2} />
            <Controls className="bg-slate-800 text-slate-300 border-slate-700 fill-slate-300" />
            <MiniMap 
              nodeColor={(n) => n.data.color || '#3b82f6'} 
              maskColor="#0f172a80"
              className="bg-slate-900 border border-slate-800"
            />
          </ReactFlow>
        </div>

        {/* Side Panel for Node Details */}
        {activeNodeId && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-20 transition-all">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white">Node Details</h3>
              <button onClick={() => setActiveNodeId(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            {nodes.find(n => n.id === activeNodeId) && (
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Title</label>
                  <input 
                    value={nodes.find(n => n.id === activeNodeId).data.label}
                    onChange={(e) => updateNodeData(activeNodeId, 'label', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
                  <select 
                    value={nodes.find(n => n.id === activeNodeId).data.status || 'Not Started'}
                    onChange={(e) => updateNodeData(activeNodeId, 'status', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Achieved">Achieved</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Notes / Description</label>
                  <textarea 
                    value={nodes.find(n => n.id === activeNodeId).data.notes || ''}
                    onChange={(e) => updateNodeData(activeNodeId, 'notes', e.target.value)}
                    rows={6}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Add details, links, or progress notes..."
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapMindmap(props) {
  return (
    <ReactFlowProvider>
      <MindmapCanvas {...props} />
    </ReactFlowProvider>
  );
}
