# 3videnz-siwed-react

3videnz Sign-in with Ethereum DID is a React library designed for authenticating ethr DIDs and Prometheus-X verified identities. It facilitates the implementation of Web3 login and signatures with any interoperable wallet in decentralized client applications.

## Requirements

- [Node.js](https://nodejs.org/) v18.18.0+
- [npm](https://www.npmjs.com/) v9.8.1+
- [React](https://react.dev/) v18.2.0+
- [MetaMask](https://metamask.io/) or any [WalletConnect compatible Ethereum wallet](https://walletconnect.com/explorer?type=wallet&chains=eip155%3A1) with an  account
- [WalletConnect Cloud Account](https://walletconnect.com/explorer?type=wallet&chains=eip155%3A1)

## Installation

The 3videnz-siwed-react package is not yet available in the public npm repository.

### From GitHub
```bash
npm install github:Prometheus-X-association/3videnz-siwed-react
```

> Note the repository being private you will be prompted to authenticate with your GitHub credentials and need to be part of Prometheus-X-association organization to install the package.

In order to run npm install from Docker, you need to [create an SSH key in GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) and use it in the Dockerfile:

```Dockerfile
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN ssh-agent sh -c 'echo $SSH_KEY | base64 -d | ssh-add - ; npm install'
```

### Locally
```bash
git clone git@github.com:Prometheus-X-association/3videnz-siwed-react.git
```

As `3videnz-siwed-react` is installed locally, the React package needs to be linked to the client application dependency:

```bash
cd ./3videnz-siwed-react
npm link ../<client-application-project>/node_modules/react
```

Install the local dependency in the client application project:

```bash
cd ../<client-application-project>
npm install ../3videnz-siwed-react
```

Finally, the client application can be run normally.

## Configuration

The client application must contain the configuration file `./src/siwed.config.js`

```javascript
import { defineConfig } from '3videnz-siwed-react'

// Get projectId at https://cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID'

// Client application metadata
const metadata = { name: 'My Website', description: 'My Website description', url: 'https://mywebsite.com' }

// Set the client application supported chains
const chains = [{
  chainId: 43113,
  name: 'Avalanche Fuji Testnet',
  currency: 'AVAX',
  explorerUrl: 'https://testnet.snowtrace.io/',
  rpcUrl: 'https://avalanche-fuji-c-chain.publicnode.com'
}]

// Define the statement signed by the end-user during login
const statement = 'I accept the My Website Terms of Service: https://service.org/tos'

// Set the created session time to live
const timeToLive = { duration: 1, unit: 'days' } // Supported units: https://momentjs.com/docs/#/durations/as/

export default defineConfig({ projectId, metadata, chains, statement, timeToLive })
```

> While 3videnz Sign-in with Ethereum DID supports configuring multiple EVM compatible chains adhering to the [CAIP-25](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-25.md) standard, it is recommended to limit to a signle network at the moment 

### Setup
Import the configuration in the client application `./src/index.js` file to set up 3videnz Sign-in with Ethereum DID

```javascript
import './siwed.config.js'
```

### Optional configurations

#### Included wallets

By default, 3videnz Sign-in with Ethereum DID supports the exhaustive [WalletConnect compatible wallet list](https://walletconnect.com/explorer?type=wallet). The client application should limit the available wallets with the following configuration:

```javascript
import { defineConfig } from '3videnz-siwed-react'

...

// Override default recommended wallets that are fetched from WalletConnect explorer
const includeWalletIds = [ 
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  ... 
]

export default defineConfig({ ..., includeWalletIds })
```

### Custom wallets

Alternatively you can use [WalletConnect](https://walletconnect.com/) compatible custom wallets. 

```javascript
import { defineConfig } from '3videnz-siwed-react'

...

// Override default recommended wallets that are fetched from WalletConnect explorer
const includeWalletIds = [{
  id: 'mywallet.cloud',
  name: 'mywallet.cloud',
  webapp_link: 'https://staging.mywallet.cloud/',
  image_url: '/mywallet-icon-512.png'
}]

export default defineConfig({ ..., includeWalletIds })
```

> Note the image file must be included in the public resources of the client application. Mywallet's icon can be found in 'public' folder.

> The demo configuration uses mywallet's staging environment URL. Production URL is https://app.mywallet.cloud/

#### Identity registries

3videnz Sign-in with Ethereum DID can check ownership of verified identities in smart-contract registries. When found the certified data is returned in the session otherwise the login will fail.

Smart-contract registries can be:
-  [3videnz-RevealableConsensualSBT](https://github.com/Prometheus-X-association/3videnz-RevealableConsensualSBT) - checks ownership of a collection token
-  [Prometheus-X-catalogs-directory](https://github.com/Prometheus-X-association/Prometheus-X-catalogs-directory) - checks ownership of a token among all the collections in the directory

```javascript
import { defineConfig } from '3videnz-siwed-react'

...

// Configure the registries 
const identityRegistries = [{
  type: 'EvidenzRevealableConsensualSBT',
  chainId: '0xa869',
  address: '0x370C1fbef3749d7FdA233f4383753EC416402dD5'
}, {
  type: 'PrometheusXCatalogsDirectory',
  chainId: '0xa869',
  address: '0x9A4821b0F5b6343AB27297cf96E8B4c6b8464136'
}]

export default defineConfig({ ..., identityRegistries })
```

#### Certified data

Alternatively 3videnz Sign-in with Ethereum DID can be mocked to return a configured value value.

```javascript
import { defineConfig } from '3videnz-siwed-react'

...

// Mock the returned verified identity 
const certified_data = {
  credential_type: 'verifiedIdentity', 
  company_name: 'This is a demonstration content',
  px_credential: 'All these attributes are available in session.verifiedIdentity',
  additional_info: 'It will eventually be the verified identity NFT content'
}

export default defineConfig({ ..., verifiedIdentity })
```

## Usage

3videnz Sign-in with Ethereum DID hooks can be used in any React components

```JSX

import { useWallet } from '3videnz-siwed'
import { useState } from 'react'

function App() {
  const { session, error, login, logout, signer } = useWallet()
  const [ message, setMessage ] = useState("")
  const [ signature, setSignature ] = useState("")

  const onSubmitHandler = async event => {
    try {
      event.preventDefault()
      setSignature(await signer.signMessage(message))
    } catch (e) {
      alert(e)
    }
  }

  const inputChangeHandler = event => {
    setSignature("")
    setMessage(event.target.value)
  }

  return <div>
    { error ? <p>An error occured: {error.message}</p> : <div></div> }
    { !session 
      ? <button onClick={login}>Log in</button> 
      : <div>
          <button onClick={logout}>Log out</button>
          <form onSubmit={onSubmitHandler}>
            <input id="message" onChange={inputChangeHandler} />
            <button type="submit">Sign</button>
          </form>
          <pre>{ signature }</pre>
          <div>
            <p>{ 'You are logged with session:' }</p>
            <pre>{ JSON.stringify(session, null, 2) }</pre>
          </div>
        </div> 
    }
  </div>
}

export default App
```

## Session
The login results in a session object that can be used throughout the client application.

```JSON
{
  "domain": "mywebsite.com",
  "address": "0x...",
  "statement": "I accept the My Website Terms of Service: https://service.org/tos",
  "uri": "https://mywebsite.com",
  "version": "1",
  "nonce": "qu0nzbXkElnhqaxlp",
  "issuedAt": "2023-12-01T08:49:26.551Z",
  "expirationTime": "2023-12-02T08:49:26.544Z",
  "chainId": 5,
  "did": "did:ethr:0x...",
  "certified_data": {
    "credential_type": "verifiedIdentity",
    "company_name": "This is a demonstration content",
    "px_credential": "All these attributes are available in session.verifiedIdentity",
    "additional_info": "It will eventually be the verified identity NFT content"
  }
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)