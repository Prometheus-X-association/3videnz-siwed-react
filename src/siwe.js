import moment from 'moment'
import { generateNonce, SiweMessage, SiweError } from 'siwe'

let config = {}

function defineConfig({ statement, timeToLive }) {
  config = { statement, timeToLive }
}

function createSiweMessage (address, chainId) {
  const { statement, timeToLive } = config
  const domain = window.location.host
  const uri = window.location.origin
  const nonce = generateNonce()
  const version = '1'
  const expirationTime = moment().utc().add(timeToLive.duration, timeToLive.unit).toISOString()
  return new SiweMessage({ domain, address, statement, uri, nonce, version, chainId, expirationTime }).prepareMessage()
}

export { defineConfig, createSiweMessage, SiweMessage, SiweError }