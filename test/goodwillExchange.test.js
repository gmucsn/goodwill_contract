import { test } from 'tape-promise/tape';

import { makeZoe } from '@agoric/zoe';
import bundleSource from '@agoric/bundle-source';
// Import of agoric's harden capability
import harden from '@agoric/harden';
import { E } from '@agoric/eventual-send';

import { makeGetInstanceHandle } from '@agoric/zoe/src/clientSupport';
// Seutp reference to mintpayments contract
const mintPaymentsRoot = `/Users/Shared/repos/smart_contracts/goodwill_contracts/src/mintPayments`;

// import {
//   paymentForAlice,
//   baytownBucks,
//   baytownBucksIssuer,
// } from '../examples/baytownBucks';


// // Goodwill currency creation
// import {
//     goodwillMint,
//     goodwillIssuer,
//     goodwillAmountMath,
//   } from '../examples/setup/goodwillMint';

//   import {
//     itemMint,
//     itemIssuer,
//     itemAmountMath,
//   } from '../examples/setup/itemMint';

//   import {
//     moneyMint,
//     moneyIssuer,
//     moneyAmountMath,
//   } from '../examples/setup/moneyMint';


// // Agoric registrar... for contracts?
// import { makeRegistrar } from '@agoric/registrar';



// // Getting zoe imported for use
// import { setupZoe } from '../examples/setup/setupZoe';

// //import makeBob from '../examples/tradeWithAtomicSwap/bob';

// // import for goodwill Alice
// import makeAlice from '../examples/tradeWithAtomicSwap/goodwillAlice';
// import makeBob from '../examples/tradeWithAtomicSwap/goodwillBob';



// const baytownBucksAmountMath = baytownBucksIssuer.getAmountMath();
// Let's make sure that the payment we would send to Alice has the
// correct balance.
test('Testing the goodwill exchange setup....', async (t) => {
    t.comment("Zoe initialized");
    const zoe = makeZoe({ require });
    //const { zoe, installations } = await setupZoe();

    t.comment("Minting payments root...");
    const { source, moduleFormat } = await bundleSource(mintPaymentsRoot);

    t.comment("Source bundled....");
    const installationHandle = await E(zoe).install(source, moduleFormat);
    const inviteIssuer = await E(zoe).getInviteIssuer();
    const getInstanceHandle = makeGetInstanceHandle(inviteIssuer);

    // t.comment("Getting invite issuer from Zoe");
    // const inviteIssuer = zoe.getInviteIssuer();

    // t.comment("Getting goodwill mint issuer");
    // const goodwill = goodwillIssuer.getAmountMath().make;
  
    // t.comment("Getting money mint issuer");
    // const money = moneyIssuer.getAmountMath().make;

    // t.comment("Getting item mint issuer");
    // const item = itemIssuer.getAmountMath().make;


    // t.comment("Creating a registrar");
    // const registrar = makeRegistrar();

    
    // t.comment("Getting invite issuer for contract");
    // const inviteIssuerRegKey = registrar.register('inviteIssuer', inviteIssuer);
  
    // t.comment("Getting our goodwill registrar issuer");
    // const goodwillIssuerRegKey = registrar.register('goodwillIssuer', goodwillIssuer);

    // t.comment("Getting our money registrar issuer");
    // const moneyIssuerRegKey = registrar.register('moneyIssuer', moneyIssuer);

    // t.comment("Getting our item registrar issuer");
    // const itemIssuerRegKey = registrar.register('itemIssuer', itemIssuer);


    // t.comment("Prep wallet for use across both users");
    // const walletData = harden({
    //     issuers: [
    //         // need at least an issuer for goodwill
    //         { issuer: goodwillIssuer, regKey: goodwillIssuerRegKey, petname: 'goodwill' },
    //         // need a reference for invite issuers?
    //         { issuer: inviteIssuer, regKey: inviteIssuerRegKey, petname: 'invite' },
    //         // need a reference for invite issuers?
    //         { issuer: moneyIssuer, regKey: moneyIssuerRegKey, petname: 'money' },
    //         // need a reference for invite issuers?
    //         { issuer: itemIssuer, regKey: itemIssuerRegKey, petname: 'item' },
    //     ],
    //   });
    
    // t.comment("Setting up alice's initial goodwill payment");
    // const aliceGoodwillPayment = goodwillMint.mintPayment(goodwillAmountMath.make(10));

    // t.comment("Instantiating Alice");
    // const alice = makeAlice(zoe, installations, walletData);

    // t.comment("Configuring Alice's inbox");
    // const aliceInbox = alice.getInbox();

    // t.comment("Alice initial recieve");
    // aliceInbox.receive(goodwillIssuerRegKey, aliceGoodwillPayment);

    // t.comment("Setting up Bob's payment info");
    // const bobGoodwillPayment = goodwillMint.mintPayment(
    //     goodwillAmountMath.make(15),
    // );

    // t.comment("Instantiating Bob");
    // const bob = makeBob(zoe, installations, walletData);


    // t.comment("Get bob's inbox");
    // const bobInbox = bob.getInbox();

    // t.comment("Bob setup receive");
    // bobInbox.receive(goodwillIssuerRegKey, bobGoodwillPayment);
    
    // t.comment("Bob connect with Alice");
    // bob.connectWith('alice', aliceInbox);
    
    // t.comment(" connect with bob");
    // alice.connectWith('bob', bobInbox);

    
    // const bobWallet = bob.getWallet();
    // t.comment("Bob's goodwill wallet:" + bobWallet.getBalance('goodwill'))

    // t.comment("Alice starts the swap...");
    // await alice.startSwap();
    
    // //   const aliceWallet = alice.getWallet();
    // //   const bobWallet = bob.getWallet();
    


    // t.ok(
    // baytownBucksAmountMath.isEqual(
    //   await baytownBucksIssuer.getAmountOf(paymentForAlice),
    //   baytownBucks(10),
    // ),
  //);

  t.comment("STUFF IS HAPPENING");


  t.end();
});
