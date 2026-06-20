import React, { useRef, useState, useEffect } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Plus, Edit2, Palette, Trash2, Info } from 'lucide-react';

export default function MindmapNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localLabel, setLocalLabel] = useState(data.label);
  const inputRef = useRef(null);
  
  const isRoot = data.isRoot;
  const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#64748b'];
  const currentColor = data.color || '#3b82f6';

  useEffect(() => {
    setLocalLabel(data.label);
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onLabelChange && localLabel.trim() !== '') {
      data.onLabelChange(id, localLabel);
    } else {
      setLocalLabel(data.label); // Revert if empty
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setLocalLabel(data.label);
      setIsEditing(false);
    }
  };

  // Status Indicator
  const getStatusColor = (status) => {
    switch(status) {
      case 'Achieved': return 'bg-green-500';
      case 'In Progress': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className={`relative group transition-all duration-200 ${selected ? 'scale-105 z-40' : 'z-10'}`}>
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
              className="w-5 h-5 rounded-full hover:scale-125 transition-transform border border-white shadow-sm"
              style={{ backgroundColor: c, boxShadow: currentColor === c ? `0 0 0 2px ${c}` : 'none' }}
              title={`Set color ${c}`}
            />
          ))}
        </div>

        {!isRoot && (
          <>
            <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
            <button 
              onClick={() => data.onDelete && data.onDelete(id)}
              className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
              title="Delete node (Backspace)"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </NodeToolbar>

      {/* Main Node Content */}
      <div 
        className={`px-5 py-3 rounded-xl shadow-md min-w-[120px] max-w-[250px] transition-colors border-2`}
        style={{ 
          backgroundColor: isRoot ? currentColor : '#1e293b', 
          borderColor: currentColor,
          boxShadow: selected ? `0 0 0 4px ${currentColor}40` : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-center font-medium text-white"
            autoFocus
          />
        ) : (
          <div className="text-center font-medium text-white break-words">
            {data.label}
          </div>
        )}
        
        {/* Status dot */}
        {data.status && (
          <div 
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1e293b] ${getStatusColor(data.status)}`}
            title={data.status}
          />
        )}

        {/* Target Sockets (Plug In Points) */}
        <Handle 
          type="target" 
          position={Position.Top} 
          id="top-target" 
          className="!w-4 !h-4 !bg-slate-800 !border-2 !border-slate-400 hover:!border-blue-400 hover:!bg-blue-50 transition-colors z-20" 
          title="Connect here"
        />
        <Handle 
          type="target" 
          position={Position.Left} 
          id="left-target" 
          className="!w-4 !h-4 !bg-slate-800 !border-2 !border-slate-400 hover:!border-blue-400 hover:!bg-blue-50 transition-colors z-20" 
          title="Connect here"
        />

        {/* Quick Add Buttons / Source Plugs (Drag to connect, Click to auto-add) */}
        <div className={selected || isRoot ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}>
          {/* Add Child / Source Plug (Right) */}
          <Handle
            type="source"
            position={Position.Right}
            id="right-source"
            onClick={() => data.onAddChildRight && data.onAddChildRight(id)}
            className="!w-6 !h-6 !bg-blue-500 hover:!bg-blue-600 !border-2 !border-[#1e293b] shadow-sm z-30 transition-colors flex items-center justify-center cursor-pointer"
            title="Click to add right, Drag to connect"
          >
            <Plus size={14} className="text-white pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </Handle>
          
          {/* Add Sibling / Source Plug (Bottom) */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom-source"
            onClick={() => data.onAddChildBottom && data.onAddChildBottom(id)}
            className="!w-6 !h-6 !bg-blue-500 hover:!bg-blue-600 !border-2 !border-[#1e293b] shadow-sm z-30 transition-colors flex items-center justify-center cursor-pointer"
            title="Click to add below, Drag to connect"
          >
            <Plus size={14} className="text-white pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </Handle>
        </div>
      </div>
    </div>
  );
}
