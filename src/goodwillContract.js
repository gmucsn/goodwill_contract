/* eslint-disable no-use-before-define */
import harden from '@agoric/harden';
import produceIssuer from '@agoric/ertp';
//import { makeZoeHelpers } from './contractSupport';
import { makeZoeHelpers } from '@agoric/zoe/src/contractSupport';

import { setup } from '/Users/Shared/repos/smart_contracts/goodwill_contracts/src/setupBasicMints';

/*
This is the simplest contract to mint payments and send them to users
who request them. No offer safety is being enforced here.
*/



// zcf is the Zoe Contract Facet, i.e. the contract-facing API of Zoe
export const makeContract = harden(
  /** @param {ContractFacet} zcf */ zcf => {
    const { swap, escrowAndAllocateTo, assertKeywords, checkHook } = makeZoeHelpers(zcf);
    assertKeywords(harden(['Asset', 'Price']));

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



    const  giveGoodwill = (amount, recipientHandle, minter) => {
      console.log("about to mint goodwill");

      console.log(amount);
      const payment = minter.mintPayment(amount);
      console.log("PAYMENT");
      console.log(payment);
      return escrowAndAllocateTo({
        amount,
        payment,
        keyword: 'Goodwill',
        recipientHandle,
      });
  };

  const goodwillSwap = (firstOfferHandle, offerHandle) => {
    console.log(goodwillMint);
    console.log(goodwillMint.getIssuer().getBrand().getAllegedName());
    
    const goodwill1000 = goodwillMint.getIssuer().getAmountMath().make(1000);
    console.log("GOODWILL AMOUNT CREATED");
    giveGoodwill(goodwill1000, firstOfferHandle, goodwillMint);
    console.log("GOODWILL IVEN");
    swap(firstOfferHandle, offerHandle);
  }

    const makeMatchingInvite = firstOfferHandle => {
      const {
        proposal: { want, give },
      } = zcf.getOffer(firstOfferHandle);

//      


      
      return zcf.makeInvitation(
        offerHandle => goodwillSwap(firstOfferHandle, offerHandle),
        'matchOffer',
        harden({
          customProperties: {
            asset: give.Asset,
            price: want.Price,
          },
        }),
      );
    };

    const firstOfferExpected = harden({
      give: { Asset: null },
      want: { Price: null },
    });

    return harden({
      invite: zcf.makeInvitation(
        checkHook(makeMatchingInvite, firstOfferExpected),
        'firstOffer',
      ),
    });
  },
);