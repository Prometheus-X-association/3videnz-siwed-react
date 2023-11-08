import { useState, useEffect } from 'react'
import config, { defineConfig } from './config.js'
import { createSiweMessage, SiweMessage } from './siwe.js'
import { useWeb3modal } from './web3modal.js'

function useWallet() {
  const [ error, setError ] = useState(undefined)
  const [ session, setSession ] = useState(undefined)
  const [ isSigningIn, setIsSigningIn ] = useState(false)
  const [ siwe, setSiwe ] = useState(localStorage.getItem('siwe') || undefined)
  const web3modal = useWeb3modal()
  
  useEffect(() => {
    if (siwe) {
      localStorage.setItem('siwe', siwe)
      const { message, signature } = JSON.parse(atob(siwe))
      const siweMessage = new SiweMessage(message)
      siweMessage.verify({ signature }).then(() => {
        siweMessage.did = `did:ethr:${siweMessage.address}`
        siweMessage.verifiedIdentity = config.verifiedIdentity
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
    if (isSigningIn && web3modal.isConnected) try {
      const message = createSiweMessage(web3modal.address, web3modal.chainId)
      web3modal.signer?.signMessage(message)
        .then(signature => setSiwe(btoa(JSON.stringify({ message, signature }))))
        .catch(e => setError(e))
    } finally {
      setIsSigningIn(false)
    }
  }, [ web3modal.isConnected, isSigningIn ])

  function signIn() {
    setError(undefined)
    setIsSigningIn(true)
    if (!web3modal.isConnected) web3modal.open()
  }

  function logout() {
    setSiwe(undefined)
  }

  return { session, error, signIn, logout }

}

export { useWallet, defineConfig }