import EvidenzRevealableConsensualSBT from './evidenzRevealableConsensualSBT.js'
import PrometheusXCatalogsDirectory from './prometheusXCatalogsDirectory.js'

const Type = { 
  EvidenzRevealableConsensualSBT: 'EvidenzRevealableConsensualSBT',
  PrometheusXCatalogsDirectory: 'PrometheusXCatalogsDirectory'
}

let registries = []

function defineConfig({ identityRegistries = [] }) {
  if (identityRegistries.every(({ chainId }) => chainId === identityRegistries[0].chainId)) {
    registries = identityRegistries.map(({ type, chainId, address }) => {
      switch (type) {
        case Type.EvidenzRevealableConsensualSBT: return new EvidenzRevealableConsensualSBT(chainId, address)
        case Type.PrometheusXCatalogsDirectory: return new PrometheusXCatalogsDirectory(chainId, address)
        default: throw new Error(`Unsupported config type: ${type}`)
      }
    })
    registries.forEach(async registry => await registry.validate())
  } else {
    const config = JSON.stringify(identityRegistries, null, 2)
    throw new Error(`Invalid configuration: identityRegistries must be on the same network config=${config}`)
  }
  
}

async function fetchIdentity(address) {
  if (!registries.length) return undefined
  
  const promises = registries.map(registry => registry.getCertifiedData(address))
  const responses = await Promise.allSettled(promises)
  const identity = responses.find(({ status, value}) => status === 'fulfilled' && value)?.value
  
  if (identity) return identity
  else throw new Error(`${address} does not own a verified identity`)
}

export { defineConfig, fetchIdentity }