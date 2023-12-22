import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { defineConfig } from './config.js'
import { createSiweMessage, SiweMessage, SiweError } from './siwe.js'
import { useWeb3modal } from './web3modal.js'
import { fetchIdentity, connectRegistries } from './identities'

function useWallet() {
  const [ error, _setError ] = useState(undefined)
  const [ session, setSession ] = useState(undefined)
  const [ isLoggingIn, setIsLoggingIn ] = useState(false)
  const [ siwe, setSiwe ] = useState(localStorage.getItem('siwe') || undefined)
  const [ signer, setSigner ] = useState(undefined)
  const web3modal = useWeb3modal()

  function setError(err) {
    if (!(err instanceof SiweError))
      _setError(err)
    else {
      // Possible errors: https://github.com/spruceid/siwe/blob/main/packages/siwe/lib/types.ts#L79
      let message = `${err.type.replace(/\.$/, '')}`
      if (err.expected || err.received) message += ':'
      if (err.expected) message += ` expected ${err.expected}`
      if (err.received) message += ` received ${err.received}`
      _setError(new Error(message))
    }
  }

  // Handles wallet connect/disconnect events
  useEffect(() => {
    if (!web3modal.walletProvider) {
      setSigner(undefined)
      setSiwe(undefined)
      connectRegistries(undefined)
    } else {
      const provider = new ethers.providers.Web3Provider(web3modal.walletProvider)
      setSigner(provider.getSigner())
      connectRegistries(provider.getSigner())
    }
  }, [ web3modal.walletProvider ])
  
  // Verify signed message, NFT ownerships and sets the certified data
  useEffect(() => {
    if (!siwe)  {
      localStorage.removeItem('siwe')
      setSession(undefined)
      setIsLoggingIn(false)
    } else if (signer) {
      localStorage.setItem('siwe', siwe)
      const { message, signature } = JSON.parse(atob(siwe))
      const siweMessage = new SiweMessage(message)
      siweMessage.verify({ signature })
        .then(async () => {
          siweMessage.did = `did:ethr:${siweMessage.address}`
          const certified_data = await fetchIdentity(siweMessage.address)
          if (certified_data) siweMessage.certified_data = certified_data
          setSession(siweMessage)
        })
        .catch((ex) => {
          setError(ex instanceof SiweError ? ex.error : ex)
          setSession(undefined)
        })
        .finally(() => setIsLoggingIn(false))
    }
  }, [ siwe, signer ])

  // Signs the SIWE message during login when signer is available
  useEffect(() => {
    if (web3modal.chainId && signer && isLoggingIn) signer.getAddress()
      .then(async address => {
        const message = createSiweMessage(address, web3modal.chainId)
        const signature = await signer.signMessage(message)
        setSiwe(btoa(JSON.stringify({ message, signature })))
      })
      .catch(e => {
        setError(e)
        setIsLoggingIn(false)
      })
  }, [ web3modal.chainId, signer, isLoggingIn ])

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