import React, { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Settings, Eye, EyeOff, Play, RefreshCw, Zap } from 'lucide-react';

interface ControlPanelProps {
  onSpin: (options?: { targetId?: string; targetType?: string; excludeLast?: boolean; targetLast?: boolean }) => void;
  isSpinning: boolean;
  onOpenSettings: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onSpin, isSpinning, onOpenSettings }) => {
  const { activeProfile } = useConfig();
  const [isOpen, setIsOpen] = useState(false);

  // Group items by type
  const types = Array.from(new Set(activeProfile.items.map(i => i.type).filter(Boolean))) as string[];

  if (!isOpen) {
    return (
      <div className="fixed bottom-2 right-2 z-50 opacity-20 hover:opacity-100 transition-opacity flex gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={onOpenSettings}
          disabled={isSpinning}
          className="p-2 bg-gray-800 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Settings"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-gray-800 text-white rounded-full shadow-lg"
          title="Open Controls"
        >
          <EyeOff size={16} />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 border-t border-gray-700 p-4 text-white shadow-2xl backdrop-blur-md transform transition-transform duration-300 cursor-default"
      style={{ WebkitAppRegion: 'no-drag' } as any}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">高级控制台 (直播防窥模式)</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <EyeOff size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        
        {/* Column 1: Special Spins */}
        <div className="space-y-3">
          <h4 className="font-semibold text-blue-400 flex items-center gap-2">
            <Zap size={14} /> 特殊抽奖
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSpin({ excludeLast: true })}
              disabled={isSpinning}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={14} />
              不中上一个
            </button>
            <button
              onClick={() => onSpin({ targetLast: true })}
              disabled={isSpinning}
              className="px-3 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 rounded flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={14} className="rotate-180" />
              中上一个
            </button>
          </div>
        </div>

        {/* Column 2: Target Type */}
        {types.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-green-400 flex items-center gap-2">
              <Eye size={14} /> 必中类型
            </h4>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => onSpin({ targetType: type })}
                  disabled={isSpinning}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded border border-emerald-600 transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Column 3: Target Item */}
        <div className="space-y-3">
          <h4 className="font-semibold text-purple-400 flex items-center gap-2">
            <Play size={14} /> 必中选项
          </h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {activeProfile.items.map(item => (
              <button
                key={item.id}
                onClick={() => onSpin({ targetId: item.id })}
                disabled={isSpinning}
                className="px-2 py-1 bg-purple-900/50 hover:bg-purple-800 disabled:opacity-50 rounded border border-purple-700/50 text-purple-100 truncate max-w-[120px] transition-colors"
                title={item.text}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
