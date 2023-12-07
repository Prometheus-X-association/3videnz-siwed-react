import { 
  createWeb3Modal, 
  defaultConfig, 
  useWeb3Modal, 
  useWeb3ModalAccount, 
  useWeb3ModalProvider 
} from '@web3modal/ethers5/react'

let disconnect = undefined

function defineConfig({ metadata, chains, projectId, includeWalletIds, customWallets }) {
  const ethersConfig = defaultConfig({ metadata })
  disconnect = createWeb3Modal({ ethersConfig, chains, projectId, includeWalletIds, customWallets }).disconnect
}

function useModal() {
  const { open } = useWeb3Modal()
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  return { open, address, chainId, isConnected, walletProvider, disconnect }
}

export { useModal as useWeb3modal, defineConfig }