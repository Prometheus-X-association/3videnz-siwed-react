import EvidenzRevealableConsensualSBT from './evidenzRevealableConsensualSBT.js'

const Type = { EvidenzRevealableConsensualSBT: 'EvidenzRevealableConsensualSBT' }

let registries = []

function defineConfig({ identityRegistries = [] }) {
  if (identityRegistries.some(({ chainId }) => chainId !== identityRegistries[0].chainId)) {
    const config = JSON.stringify(identityRegistries, null, 2)
    throw new Error(`Invalid configuration: identityRegistries must be on the same network config=${config}`)
  } else registries = identityRegistries.map(({ type, chainId, address }) => {
    switch (type) {
      case Type.EvidenzRevealableConsensualSBT: return new EvidenzRevealableConsensualSBT(chainId, address)
      default: throw new Error(`Unsupported config type: ${type}`)
    }
  })
}

async function fetchIdentity(address) {
  if (!registries.length) return undefined
  
  const promises = registries.map(async registry => await registry.includes(address))
  const includes = await Promise.all(promises)
  const index = includes.findIndex(included => included)
  
  if (index >= 0) return registries[index].getCertifiedData(address)
  else throw new Error(`${address} does not own a verified identity`)
}

function connectRegistries(signer) {
  registries.map(registry => registry.connect(signer))
}

export { defineConfig, connectRegistries, fetchIdentity }