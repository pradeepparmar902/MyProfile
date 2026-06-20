import React, { useRef, useState, useEffect } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Plus, Edit2, Palette, Trash2, Info } from 'lucide-react';

export default function MindmapNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'New Node');
  const inputRef = useRef(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(id, label);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  // Color preset options for the toolbar
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#eab308', // yellow
    '#a855f7', // purple
    '#22c55e', // green
    '#f97316', // orange
    '#64748b', // slate
  ];

  const nodeColor = data.color || '#3b82f6';
  const isRoot = data.isRoot;

  return (
    <>
      {/* Target handle (left side) - hidden for root node */}
      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Left} 
          style={{ background: 'transparent', border: 'none' }}
        />
      )}

      {/* Floating Toolbar (appears only when selected) */}
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="bg-white rounded-xl shadow-lg border border-slate-200 p-2 flex gap-1 z-50 mb-2"
      >
        <button 
          onClick={() => setIsEditing(true)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          title="Edit text"
        >
          <Edit2 size={16} />
        </button>
        
        <button 
          onClick={() => data.onMoreInfo && data.onMoreInfo(id)}
          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
          title="More Information / Status"
        >
          <Info size={16} />
        </button>
        
        {/* Color Picker Buttons */}
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <div className="flex gap-1 items-center px-1">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => data.onColorChange && data.onColorChange(id, c)}
              className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${nodeColor === c ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
              style={{ backgroundColor: c }}
              title={`Change color`}
            />
          ))}
        </div>

        {!isRoot && (
          <>
            <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
            <button 
              onClick={() => data.onDelete && data.onDelete(id)}
              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
              title="Delete node"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </NodeToolbar>

      {/* Main Node Container */}
      <div 
        className={`relative rounded-xl px-4 py-2 transition-all duration-200 ${
          selected ? 'ring-2 ring-offset-2 shadow-md' : 'shadow-sm hover:shadow'
        }`}
        style={{
          backgroundColor: '#1e293b', // Dark background like the reference image
          color: 'white',
          border: `2px solid ${nodeColor}`,
          boxShadow: selected ? `0 0 0 2px ${nodeColor}40` : undefined,
          minWidth: '120px',
        }}
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none text-white font-medium placeholder-slate-400"
            placeholder="Node text..."
          />
        ) : (
          <div className="font-medium">{label}</div>
        )}

        {/* Quick Add Buttons (visible when selected) */}
        {selected && (
          <>
            {/* Add Child (Right) */}
            <button
              onClick={() => data.onAddChild && data.onAddChild(id)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm z-10 border-2 border-[#1e293b]"
              title="Add Child (Tab)"
            >
              <Plus size={14} />
            </button>
            
            {/* Add Sibling (Bottom) */}
            <button
              onClick={() => data.onAddSibling && data.onAddSibling(id)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm z-10 border-2 border-[#1e293b]"
              title="Add Sibling (Enter)"
            >
              <Plus size={14} />
            </button>
          </>
        )}
      </div>

      {/* Source handle (right side) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: 'transparent', border: 'none' }}
      />
    </>
  );
}
