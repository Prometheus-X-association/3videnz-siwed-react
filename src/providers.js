import { ethers } from 'ethers'

let providers = {}

function defineConfig({ chains }) {
  chains.forEach(chain => {
    if (!(chain.chainId && chain.rpcUrl)) throw new Error(`Configured chains must define an 'chainId' and 'rpcUrl'`)
    providers[chain.chainId] = new ethers.providers.JsonRpcProvider(chain.rpcUrl) 
  })
}

export { providers as default, defineConfig }