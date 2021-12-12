const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

///////////
// İşlem Sırası
//  1 - assert, ganache Web3 modullerini çek web3 instance oluştur.
//  2 - compile edilmiş buildleri çek
//  3 - kullanacağın değişkenleri ata
//  4 - beforeEach içinde;
//      - walletları çek 
//      -factory contractı deploy et
//      -factory içinde ilk kampanyayı oluştur
//      -factoryde deploy edilen ilk contractın adresini al ve campaign olarak çek
//      -
//  5 - describe içinde it() olarak testlerini yap

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: "1000000" });

    await factory.methods.createCampaign("100").send({
        from: accounts[0],
        gas: "1000000",
    });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe("Campaigns", () => {
    it("deploys a factory and a campaign", () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    //if caller is campaign manager
    it('marks as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    })

    //if it allows people to contribute and if they are approvers
    it('allows people to be contributors and approvers', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: 200
        })
        const isContributor = await campaign.methods.approvers(accounts[1]);
        assert(isContributor)
    })

    it('checks if minimum contribition amount applied', async () => {
        try {
            const contribution = await campaign.methods.contribute().send({
                from: accounts[1],
                value: 5,
            })
            assert(false)
        } catch (error) {
            assert(error)
        }
    })

    it('allows a manager make payment request', async () => {
        await campaign.methods
            .createRequest('Buy batteries', '100', accounts[1])
            .send({ from: accounts[0], gas: 1000000 })
        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy batteries', request.description);
    })

    it('process request', async () => {
        await campaign.methods
            .contribute()
            .send({ from: accounts[0], value: web3.utils.toWei('10', 'ether') })
        await campaign.methods
            .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({ from: accounts[0], gas: "1000000" })
        await campaign.methods.approveRequest(0).send({ from: accounts[0], gas: "1000000" })
        await campaign.methods.finalizeRequest(0).send({ from: accounts[0], gas: "1000000" })

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether')
        balance = parseFloat(balance);

        assert(balance > 104)
    })
});
