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
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Save, X, Loader2, Check, Trash2 } from 'lucide-react';
import MindmapNode from './MindmapNode';
import CustomEdge from './CustomEdge';

const nodeTypes = {
  mindmap: MindmapNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Initial layout settings
const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;
const X_OFFSET = 250;
const Y_OFFSET = 80;

function MindmapCanvas({ wish, onClose, onSave, onDelete }) {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const [isSaving, setIsSaving] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [titleValue, setTitleValue] = useState(wish.title || 'Untitled Roadmap');
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
    if (params.source === params.target) return; // Prevent self-connections
    
    // Determine color based on source node
    const sourceNode = getNodes().find(n => n.id === params.source);
    const color = sourceNode?.data?.color || '#3b82f6';
    
    setEdges((eds) => {
      // Mindmap nodes should only have ONE incoming connection (one parent)
      const filteredEdges = eds.filter(e => e.target !== params.target);
      
      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.target}-${uuidv4()}`,
        type: 'custom',
        animated: true,
        style: { stroke: color, strokeWidth: 3 },
        reconnectable: true,
      };
      
      return [...filteredEdges, newEdge];
    });
  }, [setEdges, getNodes]);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    if (newConnection.source === newConnection.target) return; // Prevent self-connections
    
    setEdges((els) => {
      // If reconnecting to a new target, remove any existing connection to that target
      const filtered = els.filter(e => e.id !== oldEdge.id && e.target !== newConnection.target);
      
      const newEdge = {
        ...oldEdge,
        ...newConnection,
      };
      
      return [...filtered, newEdge];
    });
  }, [setEdges]);

  const onMoreInfo = useCallback((id) => {
    setActiveNodeId(id);
  }, []);

  const updateNodeData = useCallback((id, key, value) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n))
    );
  }, [setNodes]);

  const addChildNodeRight = useCallback((sourceId) => {
    const sourceNode = getNodes().find(n => n.id === sourceId);
    if (!sourceNode) return;

    const newNodeId = uuidv4();
    let newX = sourceNode.position.x + 250;
    let newY = sourceNode.position.y;
    
    const childEdges = getEdges().filter(e => e.source === sourceId);
    if (childEdges.length > 0) {
      const childNodes = getNodes().filter(n => childEdges.some(e => e.target === n.id));
      newY = Math.max(...childNodes.map(n => n.position.y)) + 80;
    }
    
    const newNode = {
      id: newNodeId,
      type: 'mindmap',
      position: { x: newX, y: newY },
      data: { 
        label: 'New Node', 
        color: sourceNode.data.color,
        status: 'Not Started',
        notes: '',
      },
    };

    const newEdge = {
      id: `e-${sourceId}-${newNodeId}`,
      source: sourceId,
      target: newNodeId,
      sourceHandle: 'right-source',
      targetHandle: 'left-target',
      type: 'custom',
      style: { stroke: sourceNode.data.color, strokeWidth: 3 },
      animated: true,
      reconnectable: true,
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setTimeout(() => setNodes((nds) => nds.map(n => ({ ...n, selected: n.id === newNodeId }))), 50);
  }, [getNodes, getEdges, setNodes, setEdges]);

  const addChildNodeBottom = useCallback((sourceId) => {
    const sourceNode = getNodes().find(n => n.id === sourceId);
    if (!sourceNode) return;

    const newNodeId = uuidv4();
    let newX = sourceNode.position.x;
    let newY = sourceNode.position.y + 150;
    
    const childEdges = getEdges().filter(e => e.source === sourceId);
    if (childEdges.length > 0) {
      const childNodes = getNodes().filter(n => childEdges.some(e => e.target === n.id));
      newX = Math.max(...childNodes.map(n => n.position.x)) + 200;
    }
    
    const newNode = {
      id: newNodeId,
      type: 'mindmap',
      position: { x: newX, y: newY },
      data: { 
        label: 'New Node', 
        color: sourceNode.data.color,
        status: 'Not Started',
        notes: '',
      },
    };

    const newEdge = {
      id: `e-${sourceId}-${newNodeId}`,
      source: sourceId,
      target: newNodeId,
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'custom',
      style: { stroke: sourceNode.data.color, strokeWidth: 3 },
      animated: true,
      reconnectable: true,
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setTimeout(() => setNodes((nds) => nds.map(n => ({ ...n, selected: n.id === newNodeId }))), 50);
  }, [getNodes, getEdges, setNodes, setEdges]);

  // Retroactively fix existing edges and remove self-connections
  useEffect(() => {
    setEdges((eds) => 
      eds
        .filter(e => e.source !== e.target) // Drop self-connections
        .map(e => {
          if (e.type !== 'custom' || e.reconnectable !== true) {
            return { ...e, type: 'custom', reconnectable: true };
          }
          return e;
        })
    );
  }, [setEdges]);

  // Update node data dynamically for newly created nodes
  const nodeCount = nodes.length;
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.data.onColorChange) return n; // Already injected
        return {
          ...n,
          data: {
            ...n.data,
            onLabelChange,
            onColorChange,
            onDelete: deleteNode,
            onAddChildRight: addChildNodeRight,
            onAddChildBottom: addChildNodeBottom,
            onMoreInfo,
          },
        };
      })
    );
  }, [nodeCount, setNodes, onLabelChange, onColorChange, deleteNode, addChildNodeRight, addChildNodeBottom, onMoreInfo]);

  // Handle Keyboard Shortcuts
  const onKeyDown = useCallback((event) => {
    const selectedNodes = getNodes().filter(n => n.selected);
    if (selectedNodes.length === 1) {
      const selectedNode = selectedNodes[0];
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.key === 'Tab') {
        event.preventDefault();
        addChildNodeRight(selectedNode.id);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        addChildNodeBottom(selectedNode.id);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        if (!selectedNode.data.isRoot) deleteNode(selectedNode.id);
      }
    }
  }, [getNodes, addChildNodeRight, addChildNodeBottom, deleteNode]);

  const handleSave = async () => {
    setIsSaving(true);
    const mindmapData = { nodes: getNodes(), edges: getEdges() };
    
    if (wish.id.startsWith('new')) {
      const res = await fetch(`/api/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: titleValue, 
          description: wish.description || '', 
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
        body: JSON.stringify({ 
          title: titleValue,
          description: wish.description || '',
          mindmapData: JSON.stringify(mindmapData) 
        }),
      });
    }
    
    setIsSaving(false);
    if (onSave) onSave(mindmapData, wish.id.startsWith('new'), titleValue);
  };

  // Autosave Effect
  useEffect(() => {
    // Only auto-save if nodes exist
    if (!nodes || nodes.length === 0) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1500); // 1.5 second debounce

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, titleValue]);

    <div className={`relative ${wish.isInline ? "w-full h-full flex flex-col rounded-2xl overflow-hidden shadow-sm border border-slate-200" : "fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm"}`} onKeyDown={onKeyDown}>
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-50 pointer-events-none">
        <div className="flex justify-between items-start gap-4 pointer-events-auto bg-[#0f172a]/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700/50">
          <div>
            {isEditingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="bg-slate-800 text-xl font-bold text-white px-2 py-1 rounded border border-blue-500 outline-none w-64 mb-1"
                autoFocus
              />
            ) : (
              <h2 
                className="text-xl font-bold text-white cursor-pointer hover:text-blue-300 transition-colors mb-1 group flex items-center gap-2"
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename"
              >
                {titleValue} <span className="opacity-0 group-hover:opacity-100 text-sm font-normal text-blue-400">✏️</span>
              </h2>
            )}
            <p className="text-sm text-slate-400">Press Tab to add a child step, Enter to add a sibling step.</p>
          </div>
          {onDelete && (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Delete Roadmap"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <div className="flex gap-3 pointer-events-auto bg-[#0f172a]/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700/50">
          {!wish.isInline && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={16} /> Close
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800 rounded-lg border border-slate-700">
            {isSaving ? (
              <><Loader2 size={14} className="animate-spin" /> Autosaving...</>
            ) : (
              <><Check size={14} className="text-emerald-500" /> Saved</>
            )}
          </div>
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
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            translateExtent={[[-5000, -100], [5000, 10000]]}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            panOnScroll={true}
            className="bg-[#0f172a]" // Deep dark slate background
            defaultEdgeOptions={{ type: 'custom', animated: true }}
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
                    value={nodes.find(n => n.id === activeNodeId).data.status || 'Not yet started'}
                    onChange={(e) => updateNodeData(activeNodeId, 'status', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Not yet started">Not yet started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Achieved">Achieved</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Start Date</label>
                    <input 
                      type="date"
                      value={nodes.find(n => n.id === activeNodeId).data.startDate || ''}
                      onChange={(e) => updateNodeData(activeNodeId, 'startDate', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Target Date</label>
                    <input 
                      type="date"
                      value={nodes.find(n => n.id === activeNodeId).data.endDate || ''}
                      onChange={(e) => updateNodeData(activeNodeId, 'endDate', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
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

      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Delete Roadmap?</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to permanently delete the <strong className="text-white">"{titleValue}"</strong> roadmap? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsConfirmingDelete(false);
                  onDelete();
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoadmapMindmap({ wish, onClose, onSave, onDelete }) {
  if (!wish) return null;
  return (
    <ReactFlowProvider>
      <MindmapCanvas wish={wish} onClose={onClose} onSave={onSave} onDelete={onDelete} />
    </ReactFlowProvider>
  );
}
