// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "bech32",
      "bn.js",
      "js-sha3",
      "hash.js",
      "hash.js/lib/hash",
      "hash.js/lib/hash/sha",
      "hash.js/lib/hash/ripemd"
    ],
    exclude: [
      "md5.js",
      "@safe-global/safe-ethers-lib",
      "@ethersproject/providers",
      "@walletconnect/universal-provider",
      "crypto-js",
      "@eth-optimism/sdk",
      "ethjs-unit"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAnYmVjaDMyJyxcbiAgICAgICdibi5qcycsIFxuICAgICAgJ2pzLXNoYTMnLFxuICAgICAgJ2hhc2guanMnLFxuICAgICAgJ2hhc2guanMvbGliL2hhc2gnLFxuICAgICAgJ2hhc2guanMvbGliL2hhc2gvc2hhJyxcbiAgICAgICdoYXNoLmpzL2xpYi9oYXNoL3JpcGVtZCdcbiAgICBdLFxuICAgIGV4Y2x1ZGU6IFtcbiAgICAgICdtZDUuanMnLFxuICAgICAgJ0BzYWZlLWdsb2JhbC9zYWZlLWV0aGVycy1saWInLFxuICAgICAgJ0BldGhlcnNwcm9qZWN0L3Byb3ZpZGVycycsXG4gICAgICAnQHdhbGxldGNvbm5lY3QvdW5pdmVyc2FsLXByb3ZpZGVyJyxcbiAgICAgICdjcnlwdG8tanMnLFxuICAgICAgJ0BldGgtb3B0aW1pc20vc2RrJyxcbiAgICAgICdldGhqcy11bml0J1xuICAgIF1cbiAgfVxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
