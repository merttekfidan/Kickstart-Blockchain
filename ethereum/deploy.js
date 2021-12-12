const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require('web3');
const { interface, bytecode } = require('./compile')
const compiledFactory = require('./build/CampaignFactory.json')
const provider = new HDWalletProvider(
    'bleak bone sibling void crash art boss panic merit resemble power crouch',
    'https://rinkeby.infura.io/v3/c9f0a049027845e9a6a5e1c06238cdad'
)

const web3 = new Web3(provider)

const deploy = async () => {
    // accountları çek
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0])
    //Contractı deploy et
    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode})
        .send({ gas: 1000000, from: accounts[0] })
    console.log('Contract deployed to', result.options.address)
    provider.engine.stop()
}
deploy()