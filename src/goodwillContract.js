/* eslint-disable no-use-before-define */
import harden from '@agoric/harden';
import produceIssuer from '@agoric/ertp';
//import { makeZoeHelpers } from './contractSupport';
import { makeZoeHelpers } from '@agoric/zoe/src/contractSupport';
/*
This is the simplest contract to mint payments and send them to users
who request them. No offer safety is being enforced here.
*/

// zcf is the Zoe Contract Facet, i.e. the contract-facing API of Zoe
export const makeContract = harden(zcf => {
    // Adding code for the goodwill issuer
    const { issuer, mint, amountMath } = produceIssuer('tokens');
    const zoeHelpers = makeZoeHelpers(zcf);


    const { swap, assertKeywords, checkHook } = makeZoeHelpers(zcf);
    assertKeywords(harden(['Asset', 'Price']));
  
    const makeMatchingInvite = firstOfferHandle => {
      const {
        proposal: { want, give },
      } = zcf.getOffer(firstOfferHandle);
  
      return zcf.makeInvitation(
        offerHandle => swap(firstOfferHandle, offerHandle),
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
  
    // Inserting mint payments return wrapper

    return zcf.addNewIssuer(issuer, 'Token').then(() => {

        const offerHook = offerHandle => {
            // We will send everyone who makes an offer 1000 tokens
      
            const tokens1000 = amountMath.make(1000);
            const payment = mint.mintPayment(tokens1000);
      
            // Let's use a helper function which escrows the payment with
            // Zoe, and reallocates to the recipientHandle.
            return zoeHelpers
              .escrowAndAllocateTo({
                amount: tokens1000,
                payment,
                keyword: 'Token',
                recipientHandle: offerHandle,
              })
              .then(() => {
                // Complete the user's offer so that the user gets a payout
                zcf.complete(harden([offerHandle]));
      
                // Since the user is getting the payout through Zoe, we can
                // return anything here. Let's return some helpful instructions.
                return 'Offer completed. You should receive a payment from Zoe';
              });
          };

          // A function for making invites to this contract
            const makeMintInvite = () => zcf.makeInvitation(offerHook, 'mint a payment');


            return harden(
                //{
                //invite: zcf.makeInvitation(
                //checkHook(makeMatchingInvite, firstOfferExpected), 'firstOffer',),
                //}
                {
                    // return an invite to the creator of the contract instance
                    // through Zoe
                    invite: makeMintInvite(),
                    publicAPI: {
                      // provide a way for anyone who knows the instanceHandle of
                      // the contract to make their own invite.
                      makeMintInvite,
                      // make the token issuer public. Note that only the mint can
                      // make new digital assets. The issuer is ok to make public.
                      getTokenIssuer: () => issuer,
                    },
                  }
            
            );
        });


  });