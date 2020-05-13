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
  zcf => {
    const helpers = makeZoeHelpers(zcf);
    const { assertKeywords, checkHook, swap } = helpers;
  
    const swapKeywords = harden(['Asset', 'Price'])
    assertKeywords(swapKeywords);
  
    const { issuer: goodwillIssuer, mint: goodwillMint, amountMath: goodwillAmountMath } = produceIssuer('goodwill');
    
    const goodwill1000 = goodwillAmountMath.make(1000);
  
    const giveGoodwill = (amount, recipientHandle) => {
      const payment = goodwillMint.mintPayment(amount);
      return helpers
        .escrowAndAllocateTo({
          amount,
          payment,
          keyword: 'Goodwill',
          recipientHandle,
        });
    };
  
    return zcf.addNewIssuer(goodwillIssuer, 'Goodwill').then(() => {
  
      const makeMatchingInvite = firstOfferHandle => {
        const {
          proposal: { want, give },
        } = zcf.getOffer(firstOfferHandle);
  
        return giveGoodwill(goodwill1000, firstOfferHandle).then(() => {
          return zcf.makeInvitation(
            offerHandle => {
              return giveGoodwill(goodwill1000, offerHandle)
                .then(() => swap(firstOfferHandle, offerHandle));
            },
            'matchOffer',
            harden({
              customProperties: {
                asset: give.Asset,
                price: want.Price,
              },
            }),
          );
        });
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
        publicAPI: {
          getGoodwillIssuer: () => goodwillIssuer,
        }
      });
    });
  }
);