import { ethers } from 'ethers'
import ABI from './abi/PrometheusXCatalogsDirectory.json'
import EvidenzRevealableConsensualSBT from './evidenzRevealableConsensualSBT.js'
import interfaces from './interfaces.js'
import providers from '../providers.js'

export default class PrometheusXCatalogsDirectory {
  constructor(chainId, address) {
    this.chainId = parseInt(chainId)
    const provider = providers[this.chainId]
    if (!provider) throw new Error(`Chain ${this.chainId} is not configured`) 
    this.contract = new ethers.Contract(address, ABI.abi, provider)
  }

  async validate() {
    const isPrometheusXCatalogsDirectory = await this.contract.supportsInterface(interfaces.IPrometheusXCatalogsDirectory)
    if (!isPrometheusXCatalogsDirectory) 
      throw new Error(`The catalog directory contract must implement IPrometheusXCatalogsDirectory`)
  }

  async getCertifiedData(address) {
    return await this.contract.listCatalogs()
      .then(addresses => addresses.map(catalogAddress => new EvidenzRevealableConsensualSBT(this.chainId, catalogAddress)))
      .then(catalogs => catalogs.map(catalog => catalog.getCertifiedData(address)))
      .then(promises => Promise.allSettled(promises))
      .then(responses => responses.find(({ status, value }) => status === 'fulfilled' && value))
      .then(response => response?.value || null)
  }
}