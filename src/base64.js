import { ethers } from 'ethers'

export const parseJson = base64Json => JSON.parse(
  ethers.utils.toUtf8String(
    ethers.utils.base64.decode(
      base64Json.replace(/^(data:application\/json;base64,)/, "")
    )
  )
)