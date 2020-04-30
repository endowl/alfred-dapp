# Alfred

Alfred is a decentralized crypto inheritance solution.

Missing or stolen private keys have already caused the loss of millions of dollars worth of digital assets. As more and more individuals embrace the ideals of decentralization, a pivotal question remains: “what happens to my digital assets when I can’t access them anymore?”

Website: https://alpha.alfred.estate/

Demo: https://youtu.be/855X8umwjl8

Smart Contract (Mainnet): 0xDEAD120FB5Aad12a3D3cAd140C66dad2A6739422

## How it works
To secure your digital estate, simply create or sync a Gnosis Safe, designate your beneficiaries and how much of your assets they should receive, and set the check-in period on our decentralized dead man’s switch.

### Features

#### Create your estate
Alfred uses the Gnosis Safe contract proxy kit to let users create or sync their Estate as part of a Gnosis Safe. 

The dApp uses transaction batching to create or sync the Gnosis Safe and set the owner as the individual deploying the transaction.

[Create estate screenshot](https://github.com/BatmansButler/alfred-dapp/images/newestate.jpg)

#### Designate an executor and beneficiaries and assign shares for inheritances
Set the addresses you want to receive your assets and assign shares to allow them to claim their inheritance. The owner of an Estate can also designate an executor. 

[Designate beneficiaries screenshot](https://github.com/BatmansButler/alfred-dapp/images/beneficiary.jpg)

#### Set up Recovery
In addition to serving as your personal Estate, the "Bring Out Your Dead" smart contract also provides a Gnosis Safe Recovery Module. If the owner ever loses their keys, the Recovery Module enables your Gnosis Safe and Estate to be recovered with the help of the executor and beneficiaries based on the owners preferences.

#### Generate proof-of-life using the decentralized dead man's switch
Set the number of days you want to go between checking in with Alfred and activate your estate plan with the flip of a switch. Providing proof-of-life is as simple as clicking the "Check-In" button on your Estate Dashboard.

[DMS screenshot](https://github.com/BatmansButler/alfred-dapp/images/estatedms.jpg)

When the dead man's switch stops generating proof-of-life, assets stored in the Estate and in your Gnosis Safe are distributed to the beneficiaries according to the wishes of the deceased. 

#### Token Tracker
Once you've deposited funds, use the Token Tracker on the Estate Dashboard to keep track of the value of your estate.

[Token Tracker screenshot](https://github.com/BatmansButler/alfred-dapp/images/tokentracker.jpg)

#### Have we got your interest? Allow us to hodl it with RDai!
Support our work through direct donations OR stake with RDai and allow us to keep the interest to fund continued development *without* losing your assets.

## Warning
Alfred's code has ***NOT*** been audited. Until we can convince him a security audit *doesn't* involve the IRS, please don't deposit more funds than you're willing to lose.
