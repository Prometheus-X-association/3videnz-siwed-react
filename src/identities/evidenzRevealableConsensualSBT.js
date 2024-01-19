import { ethers } from 'ethers'
import evidenz from '../data/3videnz.js'
import ABI from './abi/EvidenzRevealableConsensualSBT.json'
import interfaces from './interfaces.js'
import providers from '../providers.js'

export default class EvidenzRevealableConsensualSBT {
  constructor(chainId, address) {
    this.chainId = parseInt(chainId)
    const provider = providers[this.chainId]
    if (!provider) throw new Error(`Chain ${this.chainId} is not configured`) 
    this.contract = new ethers.Contract(address, ABI.abi, provider)
  }

  async validate() {
    const isOnChainAssests = await this.contract.supportsInterface(interfaces.IOnChainAssets)
    const isERC721Enumerable = await this.contract.supportsInterface(interfaces.IERC721Enumerable)
    if (!(isOnChainAssests && isERC721Enumerable)) 
      throw new Error(`The verified identities contract must implement IOnChainAssets && IERC721Enumerable`)
  }

  async getCertifiedData(address) {    
    const template = await this.contract.template()
    const { credential_type, data_encoding } = JSON.parse(template.value)
    
    if (credential_type !== 'verifiedIdentity')
      throw new Error(`The contract type must be 'verifiedIdentities'`)

    if ((await this.contract.balanceOf(address)).isZero()) return null
    else switch (data_encoding) {
      case '3videnZ':
        const tokenId = await this.contract.tokenOfOwnerByIndex(address, 0)
        const tokenURI = await this.contract.tokenURI(tokenId)
        return await evidenz.decode(tokenURI, template)
      default:
        throw new Error(`Unsupported data encoding ${data_encoding}`)
    }
  }
}