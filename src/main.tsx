import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { Sepolia } from '@thirdweb-dev/chains'

// Suppress Radix UI dialog title warnings from third-party components
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('DialogContent') && args[0]?.includes?.('DialogTitle')) {
    return; // Suppress this specific warning
  }
  originalConsoleError(...args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThirdwebProvider 
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
      activeChain={Sepolia}
      autoConnect={false}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>,
)