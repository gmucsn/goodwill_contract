import { test } from 'tape-promise/tape';

import { makeZoe } from '@agoric/zoe';
import bundleSource from '@agoric/bundle-source';
// Import of agoric's harden capability
import harden from '@agoric/harden';
import { E } from '@agoric/eventual-send';

import { makeGetInstanceHandle } from '@agoric/zoe/src/clientSupport';
//import { makeGetInstanceHandle } from '../../../src/clientSupport';
//import { makeZoe } from '../../../src/zoe';

// Seutp reference to mintpayments contract
const mintPaymentsRoot = `/Users/Shared/repos/smart_contracts/goodwill_contracts/src/mintPayments`;
const goodwillContractRoot = `/Users/Shared/repos/smart_contracts/goodwill_contracts/src/goodwillContract`;

import { setup } from '/Users/Shared/repos/smart_contracts/goodwill_contracts/src/setupBasicMints';



// const baytownBucksAmountMath = baytownBucksIssuer.getAmountMath();
// Let's make sure that the payment we would send to Alice has the
// correct balance.
test('Testing the goodwill exchange setup....', async (t) => {
    

    ////////////////////////
    // Starting Atomic Swap Test
    ////////////////////////

    const {
      moolaIssuer,
      simoleanIssuer,
      moolaMint,
      simoleanMint,
      moola,
      simoleans,
      goodwillIssuer,
      goodwillMint,
      goodwill,
    } = setup();
    const zoe = makeZoe({ require });
    const inviteIssuer = zoe.getInviteIssuer();
  
    // pack the contract
    const { source, moduleFormat } = await bundleSource(goodwillContractRoot);
    // install the contract
    const installationHandle = zoe.install(source, moduleFormat);
  
    // Setup Alice
    const aliceMoolaPurse = moolaIssuer.makeEmptyPurse();
    const aliceMoolaPayment = moolaMint.mintPayment(moola(3));
    const aliceGoodwillPurse = goodwillIssuer.makeEmptyPurse();
    const aliceGoodwillPayment = goodwillMint.mintPayment(goodwill(3));
    
    const aliceSimoleanPurse = simoleanIssuer.makeEmptyPurse();
    //const aliceGoodwillPurse = goodwillIssuer.makeEmptyPurse();
  

    // Setup Bob
    const bobSimoleanPayment = simoleanMint.mintPayment(simoleans(7));
    //const bobGoodwillPayment = goodwillMint.mintPayment(goodwill(100));
    const bobMoolaPurse = moolaIssuer.makeEmptyPurse();
    const bobSimoleanPurse = simoleanIssuer.makeEmptyPurse();
    const bobGoodwillPurse = goodwillIssuer.makeEmptyPurse();
  
  
    // 1: Alice creates an atomicSwap instance
    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
      //Goodwiller: goodwillIssuer
    });
    const aliceInvite = await zoe.makeInstance(
      installationHandle,
      issuerKeywordRecord,
    );
  
    // 2: Alice escrows with zoe
    const aliceProposal = harden({
      give: { Asset: moola(3) },
      want: { Price: simoleans(7)
        //, Goodwiller: goodwill(100)
       },
      exit: { onDemand: null },
    });
    const alicePayments = { Asset: aliceMoolaPayment };
  
    // 3: Alice makes the first offer in the swap.
    const { payout: alicePayoutP, outcome: bobInviteP } = await zoe.offer(
      aliceInvite,
      aliceProposal,
      alicePayments,
    );
  
    t.comment("ALICE SIDE DONE");
    t.comment("ALICE SIDE DONE");
    t.comment("ALICE SIDE DONE");
    t.comment("ALICE SIDE DONE");
    t.comment("ALICE SIDE DONE");
    t.comment("ALICE SIDE DONE");
    // 4: Alice spreads the invite far and wide with instructions
    // on how to use it and Bob decides he wants to be the
    // counter-party.
  
    t.comment("BOB SIDE STARTING");
    const bobExclusiveInvite = await inviteIssuer.claim(bobInviteP);

    t.comment("BOB getting invite");
    const {
      extent: [bobInviteExtent],
    } = await inviteIssuer.getAmountOf(bobExclusiveInvite);
  
    t.comment("BOB getting invite extent");

    const {
      installationHandle: bobInstallationId,
      issuerKeywordRecord: bobIssuers,
    } = zoe.getInstanceRecord(bobInviteExtent.instanceHandle);
  
    t.equals(bobInstallationId, installationHandle, 'bobInstallationId');
    //t.deepEquals(bobIssuers, { Asset: moolaIssuer, Price: simoleanIssuer });
    //t.deepEquals(bobInviteExtent.asset, moola(3));
    //t.deepEquals(bobInviteExtent.price, simoleans(7));
  
    t.comment("BOB Builds Proposal");
    
    const bobProposal = harden({
      give: { Price: simoleans(7) },
      want: { Asset: moola(3) },
      exit: { onDemand: null },
    });
    const bobPayments = { Price: bobSimoleanPayment, 
      //Goodwiller: bobGoodwillPayment 
    };
  
    t.comment("BOB MAKES HIS OFFER");
    // 5: Bob makes an offer
    const { payout: bobPayoutP, outcome: bobOutcomeP } = await zoe.offer(
      bobExclusiveInvite,
      bobProposal,
      bobPayments,
    );
  
    t.comment("BOB HAS WAITED FOR THE PAYOUT");
    // t.equals(
    //   await bobOutcomeP,
    //   'The offer has been accepted. Once the contract has been completed, please check your payout',
    // );

    t.comment("BOB really waiting for the payout");
    const bobPayout = await bobPayoutP;
    console.log("BOB PAYOUT RETURNING");
    console.log(bobPayout);
    // t.comment("Alice really waiting for the payout");
    // const alicePayout = await alicePayoutP;
  
    // const bobMoolaPayout = await bobPayout.Asset;
    // const bobSimoleanPayout = await bobPayout.Price;
  
    // const aliceMoolaPayout = await alicePayout.Asset;
    // const aliceSimoleanPayout = await alicePayout.Price;
  
    // // Alice gets what Alice wanted
    // t.deepEquals(
    //   await simoleanIssuer.getAmountOf(aliceSimoleanPayout),
    //   aliceProposal.want.Price,
    // );
  
    // // Alice didn't get any of what Alice put in
    // t.deepEquals(await moolaIssuer.getAmountOf(aliceMoolaPayout), moola(0));
  
    // // Alice deposits her payout to ensure she can
    // await aliceMoolaPurse.deposit(aliceMoolaPayout);
    // await aliceSimoleanPurse.deposit(aliceSimoleanPayout);
  
    // // Bob deposits his original payments to ensure he can
    // await bobMoolaPurse.deposit(bobMoolaPayout);
    // await bobSimoleanPurse.deposit(bobSimoleanPayout);
  
    // // Assert that the correct payouts were received.
    // // Alice had 3 moola and 0 simoleans.
    // // Bob had 0 moola and 7 simoleans.
    // t.equals(aliceMoolaPurse.getCurrentAmount().extent, 0);
    // t.equals(aliceSimoleanPurse.getCurrentAmount().extent, 7);
    // t.equals(bobMoolaPurse.getCurrentAmount().extent, 3);
    // t.equals(bobSimoleanPurse.getCurrentAmount().extent, 0);



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
