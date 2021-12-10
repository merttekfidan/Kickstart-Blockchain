const assert = require('assert');
const ganache = require('ganache');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
///////////
// İşlem Sırası
//  1 - assert, ganache Web3 modullerini çek web3 instance oluştur.
//  2 - compile edilmiş buildleri çek
//  3 - kullanacağın değişkenleri ata
//  4 - beforeEach içinde;
//      - walletları çek 
//      -factorye contractı parse et 
//      -ilk contractı çağır
//  5 - 
const compiledFactory = require('../etherium/build/CampaignFactory.json');
const compiledCampaign = require('../etherium/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async()=>{
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({data:compiledFactory.byteCode})
        .send({from:accounts[0], gas:'1000000'})
    
    await factory.methods.createCampaign('100').send({
        from:accounts[0], gas:'1000000'
    })

    campaignAddress = await factory.methods.getDeployedCampaigns().call();
    campaign = await web3.eth.Contract(JSON.parse(compiledFactory),campaignAddress);
})