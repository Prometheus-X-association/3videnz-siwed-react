# 3videnz-siwed-react

3videnz Sign-in with Ethereum DID is a React library designed for authenticating ethr DIDs and Prometheus-X verified identities. It facilitates the implementation of Web3 login and signatures with any interoperable wallet in decentralized client applications.

## Requirements

- [Node.js](https://nodejs.org/) v18.18.0+
- [npm](https://www.npmjs.com/) v9.8.1+
- [React](https://react.dev/) v18.2.0+
- [MetaMask](https://metamask.io/) or any [WalletConnect compatible Ethereum wallet](https://walletconnect.com/explorer?type=wallet&chains=eip155%3A1) with an Ethereum account
- [WalletConnect Cloud Account](https://walletconnect.com/explorer?type=wallet&chains=eip155%3A1)

## Installation

The 3videnz-siwed-react package is not currently available in the public npm repository. 

To install it, start by cloning its repository:

```bash
git clone git@github.com:Prometheus-X-association/3videnz-siwed-react.git
```

As the library is installed locally, the React package needs to be linked to the client application dependency:

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
  chainId: 5,
  name: 'Goerli',
  currency: 'ETH',
  explorerUrl: 'https://goerli.etherscan.io/',
  rpcUrl: 'https://ethereum-goerli.publicnode.com'
}]

// Define the statement signed by the end-user during login
const statement = 'I accept the My Website Terms of Service: https://service.org/tos'

// Set the created session time to live
const timeToLive = { duration: 1, unit: 'days' } // Supported units: https://momentjs.com/docs/#/durations/as/

export default defineConfig({ projectId, metadata, chains, statement, timeToLive })
```

> While this library supports any EVM compatible chain adhering to the [CAIP-25](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-25.md) standard and its current version scope does not read or transact with configured chains it is recommended to limit to goerli configuration at the moment 

### Optional configurations

#### Included wallets

The library by default supports the exhaustive [WalletConnect compatible wallet list](https://walletconnect.com/explorer?type=wallet). The client application should limit the available wallets with the following configuration:

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

#### Verified identity

Eventually the library will check ownership and return the content of the verified identity NFT in Prometheus-X smart-contracts. In the meantime, the returned value can be mocked using a temporary configuration:

```javascript
import { defineConfig } from '3videnz-siwed-react'

...

// Mock the returned verified identity 
const verifiedIdentity = {
  title: 'This is a demonstration content',
  description: 'All these attributes are available in session.verifiedIdentity',
  note: 'It will eventually be the verified identity NFT content'
}

export default defineConfig({ ..., verifiedIdentity })
```

## Usage

```javascript
// TODO
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)