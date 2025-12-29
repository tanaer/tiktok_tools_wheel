import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ConfigProvider } from './context/ConfigContext'
import { requireAuth } from '@tanaer/jsauth/ui'

const startApp = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </React.StrictMode>,
  )
}

// Check if running in Electron environment
if (window.electronAPI) {
  requireAuth({
    title: '直播转盘授权',
    subtitle: '请输入访问密码以启动应用',
    buttonText: '验证并启动',
    saveToken: true
  }).then(() => {
    startApp();
  }).catch(() => {
    window.electronAPI?.quitApp?.();
  });
} else {
  // Web browser fallback
  startApp();
}
