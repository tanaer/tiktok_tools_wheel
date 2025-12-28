import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Config, Profile, WheelItem, DEFAULT_PROFILE, DEFAULT_ITEMS } from '@/types';

interface ConfigContextType {
  config: Config;
  activeProfile: Profile;
  updateConfig: (updates: Partial<Config>) => void;
  updateActiveProfile: (updates: Partial<Profile>) => void;
  addProfile: (name: string) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<WheelItem>) => void;
  shuffleItems: () => void;
  reorderItems: (items: WheelItem[]) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const DEFAULT_CONFIG: Config = {
  soundEnabled: true,
  activeProfileId: 'default',
  profiles: [DEFAULT_PROFILE],
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  // Load config
  useEffect(() => {
    const load = async () => {
      let loadedConfig: Config | null = null;
      
      // Try electron first
      if (window.electronAPI) {
        try {
          loadedConfig = await window.electronAPI.readConfig();
        } catch (e) {
          console.error('Failed to load from electron', e);
        }
      } 
      
      // Try local storage if no electron config
      if (!loadedConfig) {
        const saved = localStorage.getItem('lucky-wheel-config-v2');
        if (saved) {
          try {
            loadedConfig = JSON.parse(saved);
          } catch (e) {}
        }
      }

      if (loadedConfig) {
        // Ensure profiles exist
        if (!loadedConfig.profiles || loadedConfig.profiles.length === 0) {
          loadedConfig.profiles = [DEFAULT_PROFILE];
          loadedConfig.activeProfileId = 'default';
        } else {
          // Migration: Add missing fields to existing profiles
          loadedConfig.profiles = loadedConfig.profiles.map(p => ({
            ...DEFAULT_PROFILE,
            ...p,
            items: p.items || DEFAULT_ITEMS,
          }));
        }
        setConfig(loadedConfig);
      }
      
      setLoaded(true);
    };
    load();
  }, []);

  // Save config
  useEffect(() => {
    if (!loaded) return;

    if (window.electronAPI) {
      window.electronAPI.writeConfig(config);
    }
    localStorage.setItem('lucky-wheel-config-v2', JSON.stringify(config));

    // Apply theme
    const active = config.profiles.find(p => p.id === config.activeProfileId) || config.profiles[0];
    if (active) {
      document.body.className = `theme-${active.theme} bg-${active.theme}-bg transition-colors duration-500`;
    }
  }, [config, loaded]);

  const activeProfile = useMemo(() => {
    return config.profiles.find(p => p.id === config.activeProfileId) || config.profiles[0] || DEFAULT_PROFILE;
  }, [config]);

  const updateConfig = (updates: Partial<Config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateActiveProfile = (updates: Partial<Profile>) => {
    setConfig(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === prev.activeProfileId ? { ...p, ...updates } : p)
    }));
  };

  const addProfile = (name: string) => {
    const newProfile: Profile = {
      ...DEFAULT_PROFILE,
      id: crypto.randomUUID(),
      name,
      items: DEFAULT_ITEMS, // Ensure fresh items
    };
    setConfig(prev => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      activeProfileId: newProfile.id
    }));
  };

  const removeProfile = (id: string) => {
    if (config.profiles.length <= 1) return;
    setConfig(prev => {
      const newProfiles = prev.profiles.filter(p => p.id !== id);
      const newActiveId = prev.activeProfileId === id ? newProfiles[0].id : prev.activeProfileId;
      return {
        ...prev,
        profiles: newProfiles,
        activeProfileId: newActiveId
      };
    });
  };

  const setActiveProfile = (id: string) => {
    setConfig(prev => ({ ...prev, activeProfileId: id }));
  };

  const addItem = () => {
    const newItem: WheelItem = {
      id: crypto.randomUUID(),
      text: '新奖项',
      probability: 10,
    };
    updateActiveProfile({ items: [...activeProfile.items, newItem] });
  };

  const removeItem = (id: string) => {
    if (activeProfile.items.length <= 2) {
      // alert('至少需要保留两个选项！'); 
      return;
    }
    updateActiveProfile({ items: activeProfile.items.filter(i => i.id !== id) });
  };

  const updateItem = (id: string, updates: Partial<WheelItem>) => {
    updateActiveProfile({
      items: activeProfile.items.map(i => i.id === id ? { ...i, ...updates } : i)
    });
  };

  const shuffleItems = () => {
    const items = [...activeProfile.items];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    updateActiveProfile({ items });
  };

  const reorderItems = (items: WheelItem[]) => {
    updateActiveProfile({ items });
  };

  return (
    <ConfigContext.Provider value={{
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
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
