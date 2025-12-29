import { useState, useEffect } from 'react';
import { Wheel } from '@/components/Wheel';
import { SettingsModal } from '@/components/SettingsModal';
import { useWheelLogic } from '@/hooks/useWheelLogic';
import { useConfig } from '@/context/ConfigContext';
import { Play } from 'lucide-react';
import { ControlPanel } from '@/components/ControlPanel';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { activeProfile } = useConfig();
  const { rotation, isSpinning, spin, winner, setWinner } = useWheelLogic();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen) return; // Disable shortcuts when modal is open
      
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault(); // Prevent scrolling or other default actions
        if (!isSpinning) {
          spin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, isSettingsOpen, spin]);

  useEffect(() => {
    if (window.electronAPI) {
      const off = window.electronAPI.onTraySpin(() => {
        if (!isSpinning) {
          spin();
        }
      });
      return () => {
        off && off();
      };
    }
  }, [isSpinning, spin]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-transparent pb-10">
      
      {/* Draggable Header Area (Invisible but functional) */}
      <div className="absolute inset-0 z-0" style={{ WebkitAppRegion: 'drag' } as any}></div>

      {/* Background Effects (Only Spin Effects now, no full background) */}
      <div className="absolute inset-0 pointer-events-none">
         {/* Removed full background divs */}
      </div>

      {/* Main Wheel Container */}
      <div className="relative z-10 scale-75 md:scale-100 transition-transform duration-500">
        <Wheel rotation={rotation} isSpinning={isSpinning} />
        
        {/* Winner Overlay */}
        <AnimatePresence>
          {winner && !isSpinning && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1.2, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center z-50 cursor-pointer"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              onClick={() => setWinner(null)}
            >
              <div className="bg-black/70 backdrop-blur-md px-8 py-6 rounded-2xl border-2 border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.5)] text-center">
              
                {/* <div className="text-2xl text-white font-light mb-1">恭喜选中</div> */}
                <div 
                  className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-500 to-purple-500 animate-pulse"
                  style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                >
                  {winner.text}
                </div>
                <div className="mt-2 text-white/50 text-sm">(点击关闭)</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Area: Spin Button & Settings Trigger */}
      <div className="flex flex-col items-center gap-4 mt-16 z-20">
        <AnimatePresence>
          {!isSpinning && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => spin()}
              className={`
                px-12 py-4 rounded-full text-2xl font-bold uppercase tracking-widest shadow-2xl transition-all
                ${activeProfile.theme === 'cyberpunk' ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/50' : ''}
                ${activeProfile.theme === 'festive' ? 'bg-yellow-500 hover:bg-yellow-400 text-red-900 shadow-yellow-500/50 border-4 border-red-600' : ''}
                ${activeProfile.theme === 'christmas' ? 'bg-red-600 hover:bg-red-500 text-white border-4 border-white border-dashed shadow-red-500/50' : ''}
                ${activeProfile.theme === 'flat' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30' : ''}
              `}
              style={{ WebkitAppRegion: 'no-drag' } as any}
            >
              <span className="flex items-center gap-2">
                <Play className="fill-current" /> 开始抽奖
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Hidden Control Panel for Live Stream Control */}
      <ControlPanel onSpin={spin} isSpinning={isSpinning} onOpenSettings={() => setIsSettingsOpen(true)} />
    </div>
  );
}

export default App;
