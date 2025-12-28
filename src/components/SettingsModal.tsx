import React, { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { THEMES, ThemeType, PointerPosition } from '@/types';
import { X, Plus, Trash2, Volume2, VolumeX, Eye, EyeOff, Shuffle, GripVertical, Check } from 'lucide-react';
import { Reorder } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    config, 
    activeProfile, 
    updateConfig, 
    updateActiveProfile, 
    addProfile, 
    removeProfile, 
    setActiveProfile,
    addItem, 
    removeItem, 
    updateItem,
    shuffleItems,
    reorderItems
  } = useConfig();

  const [newProfileName, setNewProfileName] = useState('');
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  if (!isOpen) return null;

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      addProfile(newProfileName.trim());
      setNewProfileName('');
      setIsAddingProfile(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ WebkitAppRegion: 'no-drag' } as any}
    >
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-row cursor-default"
        style={{ WebkitAppRegion: 'no-drag' } as any}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left Sidebar: Profiles */}
        <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">配置方案</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {config.profiles.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveProfile(p.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex justify-between items-center group
                  ${config.activeProfileId === p.id 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                `}
              >
                <span className="truncate font-medium">{p.name}</span>
                {config.profiles.length > 1 && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); removeProfile(p.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {isAddingProfile ? (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="配置名称"
                  className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProfile()}
                />
                <div className="flex gap-2">
                  <button onClick={handleAddProfile} className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm">确定</button>
                  <button onClick={() => setIsAddingProfile(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 rounded hover:bg-gray-300 text-sm">取消</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingProfile(true)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" /> 新建配置
              </button>
            )}
          </div>
        </div>

        {/* Right Content: Settings */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800/50">
          {/* Header */}
          <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{activeProfile.name}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Settings */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Theme */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">主题风格</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => updateActiveProfile({ theme: key as ThemeType })}
                    className={`
                      p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden
                      ${activeProfile.theme === key 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100'}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-full ${theme.bg} shadow-sm`}></div>
                    <span className="text-sm font-medium dark:text-gray-200">{theme.label}</span>
                    {activeProfile.theme === key && (
                      <div className="absolute top-2 right-2 text-blue-500"><Check className="w-4 h-4" /></div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* General Settings */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">基础设置</h3>
              
              {/* Sound */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {config.soundEnabled ? <Volume2 className="text-green-500" /> : <VolumeX className="text-gray-400" />}
                  <span className="font-medium dark:text-gray-200">全局音效开关</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={config.soundEnabled}
                    onChange={(e) => updateConfig({ soundEnabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6"></div>

              {/* Pointer Position */}
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-gray-200">指针位置</span>
                <select
                  value={activeProfile.pointerPosition || 'top'}
                  onChange={(e) => updateActiveProfile({ pointerPosition: e.target.value as PointerPosition })}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="top">顶部 (Top)</option>
                  <option value="right">右侧 (Right)</option>
                  <option value="bottom">底部 (Bottom)</option>
                  <option value="left">左侧 (Left)</option>
                </select>
              </div>

              {/* Spin Duration */}
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-gray-200">转动时长 (秒)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={activeProfile.spinDurationSec || 8}
                    onChange={(e) => updateActiveProfile({ spinDurationSec: Number(e.target.value) })}
                    className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                  <span className="text-sm text-gray-500">建议 6-12 秒</span>
                </div>
              </div>

              {/* Logo Text */}
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-gray-200">中心文字 (LOGO)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={10}
                    value={activeProfile.logoText || 'BLOOMING'}
                    onChange={(e) => updateActiveProfile({ logoText: e.target.value })}
                    className="w-32 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center uppercase"
                  />
                  <span className="text-sm text-gray-500">最多10字符</span>
                </div>
              </div>
            </section>

            {/* Hidden Mode */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeProfile.hiddenMode ? <EyeOff className="text-purple-500" /> : <Eye className="text-gray-400" />}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">隐藏模式 (只显示指针附近内容)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">开启后转盘将被遮挡，只露出指针指向的区域</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={activeProfile.hiddenMode}
                    onChange={(e) => updateActiveProfile({ hiddenMode: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {activeProfile.hiddenMode && (
                <div className="pl-4 border-l-2 border-purple-100 dark:border-purple-900 space-y-6">
                  {/* Visible Area Size */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium dark:text-gray-300">可见区域大小</span>
                      <span className="text-sm text-purple-600 font-bold">{activeProfile.visiblePercentage || 20}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="50" 
                      value={activeProfile.visiblePercentage || 20} 
                      onChange={(e) => updateActiveProfile({ visiblePercentage: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
                    />
                  </div>

                  {/* Transparent Hide */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-300">透明隐藏 (隐藏区域完全透明)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={activeProfile.transparentHide}
                        onChange={(e) => updateActiveProfile({ transparentHide: e.target.checked })}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              )}
            </section>

            {/* Items Management */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">奖项管理</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={shuffleItems}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    title="随机打乱顺序"
                  >
                    <Shuffle className="w-4 h-4" /> 打乱
                  </button>
                  <button 
                    onClick={addItem}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> 添加奖项
                  </button>
                </div>
              </div>
              
              <Reorder.Group axis="y" values={activeProfile.items} onReorder={reorderItems} className="space-y-3">
                {activeProfile.items.map((item) => (
                  <Reorder.Item key={item.id} value={item}>
                    <div className="flex gap-3 items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-colors group cursor-default">
                      <div className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">内容</label>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateItem(item.id, { text: e.target.value })}
                            className="w-full px-2 py-1 bg-white dark:bg-gray-800 border rounded dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">类型</label>
                          <input
                            type="text"
                            value={item.type || ''}
                            onChange={(e) => updateItem(item.id, { type: e.target.value })}
                            className="w-full px-2 py-1 bg-white dark:bg-gray-800 border rounded dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">权重</label>
                          <input
                            type="number"
                            min="0"
                            value={item.probability}
                            onChange={(e) => updateItem(item.id, { probability: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-white dark:bg-gray-800 border rounded dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-4"
                        title="删除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
