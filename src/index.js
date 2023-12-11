import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import config, { defineConfig } from './config.js'
import { createSiweMessage, SiweMessage } from './siwe.js'
import { useWeb3modal } from './web3modal.js'
import { SiweError } from 'siwe'

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
        setError(error) 
        setSession(undefined)
      }).finally(() => {
        setIsLoggingIn(false)
      })
    } else {
      localStorage.removeItem('siwe')
      setSession(undefined)
      setIsLoggingIn(false)
    }
  }, [ siwe ])

  useEffect(() => {
    if (web3modal.chainId && signer && isLoggingIn) signer.getAddress()
      .then(address => createSiweMessage(address, web3modal.chainId))
      .then(async message => ({ message, signature: await signer.signMessage(message) }))
      .then(({ message, signature }) => setSiwe(btoa(JSON.stringify({ message, signature }))))
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