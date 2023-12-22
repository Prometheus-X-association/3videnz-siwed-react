import { ethers } from 'ethers'
import { parseJson } from '../base64.js'
import ABI from './abi/EvidenzRevealableConsensualSBT.json'
import interfaces from './interfaces'

export default class EvidenzRevealableConsensualSBT {
  constructor(chainId, address) {
    this.chainId = parseInt(chainId)
    this.contract = new ethers.Contract(address, ABI.abi)
  }

  connect(signer) {
    this.contract = this.contract.connect(signer)
  }

  async includes(address) {
    const connectedChainId = this.contract?.signer?.provider?.network?.chainId
    
    if (!connectedChainId || connectedChainId !== this.chainId) 
      throw new Error(`Wallet is not connected to network ${this.chainId}`)
    else if (!await this.contract.supportsInterface(interfaces.ERC721))
      throw new Error(`The verified identities contract must implement EvidenzRevealableConsensualSBT`)
      
    const balance = await this.contract.balanceOf(address)
    return !balance.isZero()
  }

  async getCertifiedData(address) {
    const connectedChainId = this.contract?.signer?.provider?.network?.chainId
    
    if (!connectedChainId || connectedChainId !== this.chainId) 
      throw new Error(`Wallet is not connected to network ${this.chainId}`)
    else if (!await this.contract.supportsInterface(interfaces.IOnChainAssets))
      throw new Error(`The verified identities contract must implement EvidenzRevealableConsensualSBT`)
    
    const template = await this.contract.template()
    const { credential_type, data_encoding } = JSON.parse(template.value)
    if (credential_type !== 'verifiedIdentity')
      throw new Error(`The contract type must be 'verifiedIdentities'`)

    switch (data_encoding) {
      case '3videnZ':
        const tokenId = await this.contract.tokenOfOwnerByIndex(address, 0)
        const tokenURI = parseJson(await this.contract.tokenURI(tokenId))
        const publicKey = tokenURI.external_url.match(/[a-zA-Z0-9]{128}/)[0]
        const [ _, env, __, domain ] = template.toolbox.url.match(/https:\/\/toolbox(-(demo|staging))?.([^.]+.[^.\/]+)/)
        return await fetch(`https://api${env || ''}.${domain}/data/${publicKey}/all`)
          .then(response => response.json())
          .then(json => Object.values(json.certified)[0])
          .then(data => {
            Object.keys(data).filter(key => key.match(/^(meta_.*|data_encoding)/)).forEach(key => delete data[key])
            return data
          })
      default:
        throw new Error(`Unsupported data encoding ${data_encoding}`)
    }
  }
}