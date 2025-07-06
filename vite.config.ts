import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['bn.js', 'js-sha3'],
    exclude: [
      'hash.js',
      'md5.js',
      '@safe-global/safe-ethers-lib',
      '@ethersproject/providers',
      '@walletconnect/universal-provider',
      'crypto-js',
      '@eth-optimism/sdk',
      'ethjs-unit'
    ]
  }
})