import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import config, { defineConfig } from './config.js'
import { createSiweMessage, SiweMessage } from './siwe.js'
import { useWeb3modal } from './web3modal.js'

function useWallet() {
  const [ error, setError ] = useState(undefined)
  const [ session, setSession ] = useState(undefined)
  const [ isLoggingIn, setIsLoggingIn ] = useState(false)
  const [ siwe, setSiwe ] = useState(localStorage.getItem('siwe') || undefined)
  const [ signer, setSigner ] = useState(undefined)
  const web3modal = useWeb3modal()

  useEffect(() => {
    if (!web3modal.walletProvider) {
      setSigner(undefined)
      setSiwe(undefined)
    } else {
      const provider = new ethers.providers.Web3Provider(web3modal.walletProvider)
      setSigner(provider.getSigner())
    }
  }, [ web3modal.walletProvider ])
  
  useEffect(() => {
    if (siwe) {
      localStorage.setItem('siwe', siwe)
      const { message, signature } = JSON.parse(atob(siwe))
      const siweMessage = new SiweMessage(message)
      siweMessage.verify({ signature }).then(() => {
        siweMessage.did = `did:ethr:${siweMessage.address}`
        siweMessage.certified_data = config.certified_data || {
          credential_type: 'verifiedIdentity' ,  
          company_name: 'This is a demonstration content',
          px_credential: 'All these attributes are available in session.verifiedIdentity',
          additional_info: 'It will eventually be the verified identity NFT content'
        }
        setSession(siweMessage)
      }).catch(({ error }) => {
        // Possible errors: https://github.com/spruceid/siwe/blob/main/packages/siwe/lib/types.ts#L79
        setError(new Error(`${error.type.replace(/\.$/, '')}: expected ${error.expected} received: ${error.received}`)) 
        setSession(undefined)
      })
    } else {
      localStorage.removeItem('siwe')
      setSession(undefined)
    }
  }, [ siwe ])

  useEffect(() => {
    if (web3modal.address && web3modal.chainId && signer && isLoggingIn) 
      try {
        const message = createSiweMessage(web3modal.address, web3modal.chainId)
        signer.signMessage(message)
          .then(signature => setSiwe(btoa(JSON.stringify({ message, signature }))))
          .catch(e => setError(e))
      } finally {
        setIsLoggingIn(false)
      }
  }, [ web3modal.address, web3modal.chainId, signer, isLoggingIn ])

  function login() {
    setError(undefined)
    setIsLoggingIn(true)
    if (!web3modal.isConnected) web3modal.open()
  }

  function logout() {
    web3modal.disconnect()
    setSiwe(undefined)
  }

  return { session, error, login, logout, signer }
}

export { useWallet, defineConfig }