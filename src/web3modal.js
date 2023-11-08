import { 
  createWeb3Modal, 
  defaultConfig, 
  useWeb3Modal, 
  useWeb3ModalAccount, 
  useWeb3ModalSigner 
} from '@web3modal/ethers5/react'

function defineConfig({ metadata, chains, projectId, includeWalletIds }) {
  const ethersConfig = defaultConfig({ metadata })
  createWeb3Modal({ ethersConfig, chains, projectId, includeWalletIds })
}

function useModal() {
  const { open } = useWeb3Modal()
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { signer } = useWeb3ModalSigner()
  return { open, address, chainId, isConnected, signer }
}

export { useModal as useWeb3modal, defineConfig }