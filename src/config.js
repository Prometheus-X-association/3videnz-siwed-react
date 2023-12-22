import { defineConfig as configIdentityRegistries } from './identities'
import { defineConfig as configSiwe } from './siwe.js'
import { defineConfig as configWeb3Modal } from './web3modal.js'

function defineConfig(config) {
  configSiwe(config)
  configWeb3Modal(config)
  configIdentityRegistries(config)
}

export { defineConfig }