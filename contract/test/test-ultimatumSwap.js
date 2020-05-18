import { test } from 'tape-promise/tape';

import { makeZoe } from '@agoric/zoe';
import bundleSource from '@agoric/bundle-source';
// Import of agoric's harden capability
import harden from '@agoric/harden';
import { E } from '@agoric/eventual-send';

import { makeGetInstanceHandle } from '@agoric/zoe/src/clientSupport';


// Seutp reference to mintpayments contract
const mintPaymentsRoot = `/Users/Shared/repos/smart_contracts/goodwill_contracts/contract/src/mintPayments`;
const goodwillContractRoot = `/Users/Shared/repos/smart_contracts/goodwill_contracts/src/goodwillContract`;
const ultimatumSwapContractRoot = `/Users/Shared/repos/smart_contracts/goodwill_contracts/contract/src/ultimatumSwap`;
import produceIssuer from '@agoric/ertp';
import { setup } from '/Users/Shared/repos/smart_contracts/goodwill_contracts/contract/src/setupBasicMints';



// const baytownBucksAmountMath = baytownBucksIssuer.getAmountMath();
// Let's make sure that the payment we would send to Alice has the
// correct balance.
test('Testing the Ultimatum Swap....', async (t) => {
  t.plan(3);
  try {
    
    const {
        moolaIssuer,
        simoleanIssuer,
        moolaMint,
        simoleanMint,
        moola,
        simoleans,
      } = setup();
    const zoe = makeZoe({ require });
    // Pack the contract.
    console.log(mintPaymentsRoot);
    const { source, moduleFormat } = await bundleSource(mintPaymentsRoot);
    
    const installationHandle = await E(zoe).install(source, moduleFormat);
    const inviteIssuer = await E(zoe).getInviteIssuer();
    const getInstanceHandle = makeGetInstanceHandle(inviteIssuer);

    const moolaBundle = produceIssuer('moola');
    const simoleanBundle = produceIssuer('simolean');
    
    // Setup Alice
    const aliceMoolaPayment = moolaMint.mintPayment(moola(3));
    const aliceMoolaPurse = moolaIssuer.makeEmptyPurse();
    const aliceSimoleanPurse = simoleanIssuer.makeEmptyPurse();

    // Setup Bob
    const bobSimoleanPayment = simoleanMint.mintPayment(simoleans(7));
    const bobMoolaPurse = moolaIssuer.makeEmptyPurse();
    const bobSimoleanPurse = simoleanIssuer.makeEmptyPurse();


    // Alice creates a contract instance
    const issuerKeywordRecord = harden({
      Asset: moolaBundle.issuer,
      Price: simoleanBundle.issuer,
    });
    const adminInvite = await E(zoe).makeInstance(
      installationHandle,
      issuerKeywordRecord,
    );
    const instanceHandle = await getInstanceHandle(adminInvite);

    // Bob wants to get 1000 tokens so he gets an invite and makes an
    // offer
    const { publicAPI } = await E(zoe).getInstanceRecord(instanceHandle);
    const invite = await E(publicAPI).makeInvite();
    t.ok(await E(inviteIssuer).isLive(invite), `valid invite`);
    const proposal = harden({
      give: { Asset: moolaBundle.amountMath.make(10) },
      want: { Price: simoleanBundle.amountMath.make(100) },
    });
    const paymentKeywordRecord = harden({
      Asset: moolaBundle.mint.mintPayment(moolaBundle.amountMath.make(10)),
    });
    const { payout: payoutP } = await E(zoe).offer(
      invite,
      proposal,
      paymentKeywordRecord,
    );

    // Bob's payout promise resolves
    const bobPayout = await payoutP;
    const bobTokenPayout = await bobPayout.Token;
    const bobMoolaPayout = await bobPayout.Asset;

    
    // Let's get the tokenIssuer from the contract so we can evaluate
    // what we get as our payout
    const tokenIssuer = await E(publicAPI).getTokenIssuer();
    const tokenAmountMath = await E(tokenIssuer).getAmountMath();

    const tokens1000 = await E(tokenAmountMath).make(1000);
    const tokenPayoutAmount = await E(tokenIssuer).getAmountOf(bobTokenPayout);

    
    const bobGoodwillPurse = tokenIssuer.makeEmptyPurse();
    await bobGoodwillPurse.deposit(bobTokenPayout);

    const moola10 = moolaBundle.amountMath.make(10);
    const moolaPayoutAmount = await moolaBundle.issuer.getAmountOf(
      bobMoolaPayout,
    );
    
    const goodwill10 = await E(tokenAmountMath).make(10);
    

    // Bob got 1000 tokens
    t.deepEquals(tokenPayoutAmount, tokens1000, `bobTokenPayout`);
    t.deepEquals(moolaPayoutAmount, moola10, `bobMoolaPayout`);

    // NOW BEGIN THE SWAP

    const { ultimatumsource, ultimatummoduleFormat } = await bundleSource(ultimatumSwapContractRoot);
    
    const ultimatuminstallationHandle = await E(zoe).install(ultimatumsource, ultimatummoduleFormat);
    

     // 1: Alice creates an atomicSwap instance
        const ultimaumSwapIssuerKeywordRecord = harden({
            Asset: moolaIssuer,
            Price: simoleanIssuer,
            Goodwill: tokenIssuer,
        });
        const aliceInvite = await zoe.makeInstance(
            ultimatuminstallationHandle,
            ultimaumSwapIssuerKeywordRecord,
        );

        // 2: Alice escrows with zoe
        const aliceProposal = harden({
            give: { Asset: moola(3) },
            want: { Price: simoleans(7), Goodwill: goodwill10 },
            exit: { onDemand: null },
        });
        const alicePayments = { Asset: aliceMoolaPayment };

        // 3: Alice makes the first offer in the swap.
        const { payout: alicePayoutP, outcome: bobInviteP } = await zoe.offer(
            aliceInvite,
            aliceProposal,
            alicePayments,
        );

        // 4: Alice spreads the invite far and wide with instructions
        // on how to use it and Bob decides he wants to be the
        // counter-party.

        const bobExclusiveInvite = await inviteIssuer.claim(bobInviteP);
        const {
            extent: [bobInviteExtent],
        } = await inviteIssuer.getAmountOf(bobExclusiveInvite);

        const {
            installationHandle: bobInstallationId,
            issuerKeywordRecord: bobIssuers,
        } = zoe.getInstanceRecord(bobInviteExtent.instanceHandle);

        t.equals(bobInstallationId, installationHandle, 'bobInstallationId');
        t.deepEquals(bobIssuers, { Asset: moolaIssuer, Price: simoleanIssuer });
        t.deepEquals(bobInviteExtent.asset, moola(3));
        t.deepEquals(bobInviteExtent.price, simoleans(7));

        const bobProposal = harden({
            give: { Price: simoleans(7), Goodwill: goodwill10 },
            want: { Asset: moola(3) },
            exit: { onDemand: null },
        });
        const bobPayments = { Price: bobSimoleanPayment, Goodwill: bobGoodwillPurse.withdraw(goodwill10)  };

        // 5: Bob makes an offer
        const { payout: bobPayoutP, outcome: bobOutcomeP } = await zoe.offer(
            bobExclusiveInvite,
            bobProposal,
            bobPayments,
        );

        t.equals(
            await bobOutcomeP,
            'The offer has been accepted. Once the contract has been completed, please check your payout',
        );
        const newbobPayout = await bobPayoutP;
        const alicePayout = await alicePayoutP;

        const newbobMoolaPayout = await newbobPayout.Asset;
        const bobSimoleanPayout = await newbobPayout.Price;

        const aliceMoolaPayout = await alicePayout.Asset;
        const aliceSimoleanPayout = await alicePayout.Price;

        // Alice gets what Alice wanted
        t.deepEquals(
            await simoleanIssuer.getAmountOf(aliceSimoleanPayout),
            aliceProposal.want.Price,
        );

        // Alice didn't get any of what Alice put in
        t.deepEquals(await moolaIssuer.getAmountOf(aliceMoolaPayout), moola(0));

        // Alice deposits her payout to ensure she can
        await aliceMoolaPurse.deposit(aliceMoolaPayout);
        await aliceSimoleanPurse.deposit(aliceSimoleanPayout);

        // Bob deposits his original payments to ensure he can
        await bobMoolaPurse.deposit(newbobMoolaPayout);
        await bobSimoleanPurse.deposit(bobSimoleanPayout);

        // Assert that the correct payouts were received.
        // Alice had 3 moola and 0 simoleans.
        // Bob had 0 moola and 7 simoleans.
        t.equals(aliceMoolaPurse.getCurrentAmount().extent, 0);
        t.equals(aliceSimoleanPurse.getCurrentAmount().extent, 7);
        t.equals(bobMoolaPurse.getCurrentAmount().extent, 3);
        t.equals(bobSimoleanPurse.getCurrentAmount().extent, 0);




  } catch (e) {
    t.assert(false, e);
    console.log(e);
  }
});
