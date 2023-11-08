import { defineConfig as configWeb3Modal } from './web3modal.js'

let config = {
  projectId: undefined,
  metadata: undefined,
  chains: undefined,
  includeWalletIds: undefined,
  statement: undefined,
  timeToLive: undefined
}

function defineConfig(newConfig) {
  config = newConfig
  configWeb3Modal(newConfig)
}

export { config as default, defineConfig }