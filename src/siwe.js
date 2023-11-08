import moment from 'moment'
import { generateNonce, SiweMessage } from 'siwe'
import config from './config.js'

function createSiweMessage (address, chainId) {
  const { statement, timeToLive } = config
  const domain = window.location.host
  const uri = window.location.origin
  const nonce = generateNonce()
  const version = '1'
  const expirationTime = moment().utc().add(timeToLive.duration, timeToLive.unit).toISOString()
  return new SiweMessage({ domain, address, statement, uri, nonce, version, chainId, expirationTime }).prepareMessage()
}

export { createSiweMessage, SiweMessage }