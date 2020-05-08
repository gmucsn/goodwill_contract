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
export const makeContract = harden(zcf => {
    // Adding code for the goodwill issuer
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

    const { issuer, mint, amountMath } = produceIssuer('tokens');
    const zoeHelpers = makeZoeHelpers(zcf);

    const { swap, rejectOffer, canTradeWith, assertKeywords, checkHook } = makeZoeHelpers(zcf);
    assertKeywords(harden(['Asset', 'Price', 
    //'Goodwiller'
  ]));
  

    const swapRepeat =  (
      keepHandle,
      tryHandle,
      keepHandleInactiveMsg = 'prior offer is unavailable',
    ) => {
      if (!zcf.isOfferActive(keepHandle)) {
        throw rejectOffer(tryHandle, keepHandleInactiveMsg);
      }
      if (!canTradeWith(keepHandle, tryHandle)) {
        throw rejectOffer(tryHandle);
      }

      //const tokens1000 = goodwill(100); //amountMath.make(1000);
      //const payment = goodwillMint.mintPayment(tokens1000);

      const tokens1000 = simoleans(100); //amountMath.make(1000);
      const payment = simoleanMint.mintPayment(tokens1000);


      const keepAmounts = zcf.getCurrentAllocation(keepHandle);
      const tryAmounts = zcf.getCurrentAllocation(tryHandle);
      // reallocate by switching the amount
      
      //const handles = harden([keepHandle, tryHandle]);
      //zcf.reallocate(handles, harden([tryAmounts, keepAmounts]));
      //zcf.complete(handles);
      //return `The offer has been accepted. Once the contract has been completed, please check your payout`;
      // return zoeHelpers
      // .escrowAndAllocateTo({
      //   amount: tokens1000,
      //   payment,
      //   keyword: 'Token',
      //   recipientHandle: tryHandle,
      // })
      // .then(() => {


        // const newSellerAmounts = { Asset: assetAmountMath.getEmpty(), Bid: price };
        // const newWinnerAmounts = { Asset: assetAmount, Bid: winnerRefund };
      
        // const newKeepAmounts = { Asset: assetAmountMath.getEmpty(), goodwiller: payment };
        // const newTryAmounts = { Asset: assetAmount, Bid: winnerRefund };
      
        zoeHelpers.escrowAndAllocateTo({
          amount: tokens1000,
          payment,
          keyword: 'Simolean',
          recipientHandle: keepHandle,
        }).then(() => {
          // Complete the user's offer so that the user gets a payout
          // zcf.complete(harden([keepHandle]));

          //const handles = harden([keepHandle, tryHandle]);
          //zcf.reallocate(handles, harden([tryAmounts, keepAmounts]));
          //zcf.complete(handles);
          zcf.complete(harden([keepHandle]));
          // Since the user is getting the payout through Zoe, we can
          // return anything here. Let's return some helpful instructions.
          //return 'Offer completed. You should receive a payment from Zoe';
          return 'Offer completed. You should receive a payment from Zoe';
        });;

        // zoeHelpers.escrowAndAllocateTo({
        //   amount: tokens1000,
        //   payment,
        //   keyword: 'Goodwiller',
        //   recipientHandle: tryHandle,
        //});

        // Everyone else gets a refund so their extents remain the
        // same.
        // zoe.reallocate(
        //   harden([sellerOfferHandle, winnerOfferHandle]),
        //   harden([newSellerAmounts, newWinnerAmounts]),
        // );
        // const allOfferHandles = harden([sellerOfferHandle, ...activeBidHandles]);
        // zoe.complete(allOfferHandles);


        // const handles = harden([keepHandle, tryHandle]);
        // zcf.reallocate(handles, harden([tryAmounts, keepAmounts]));
        // zcf.complete(handles);
      

        // Complete the user's offer so that the user gets a payout
        //zcf.complete(harden([keepHandle]));

        // Since the user is getting the payout through Zoe, we can
        // return anything here. Let's return some helpful instructions.
        //return 'Offer completed. You should receive a payment from Zoe';
      // });
      

    };



    
    const makeMatchingInvite = firstOfferHandle => {
      const {
        proposal: { want, give },
      } = zcf.getOffer(firstOfferHandle);
  
      return zcf.makeInvitation(
        offerHandle => swapRepeat(firstOfferHandle, offerHandle),
        'matchOffer',
        harden({
          customProperties: {
            asset: give.Asset,
            price: want.Price,
            //goodwiller: want.Goodwiller
          },
        }),
      );
    };
  
    const firstOfferExpected = harden({
      give: { Asset: null },
      want: { Price: null, 
            //  Goodwiller: null
             },
    });
  
    // Inserting mint payments return wrapper


    return harden({
      invite: zcf.makeInvitation(
        checkHook(makeMatchingInvite, firstOfferExpected),
        'firstOffer',
      ),
    });

    // return zcf.addNewIssuer(issuer, 'Token').then(() => {

    //     const offerHook = offerHandle => {
    //         // We will send everyone who makes an offer 1000 tokens
      
    //         const tokens1000 = amountMath.make(1000);
    //         const payment = mint.mintPayment(tokens1000);
      
    //         // Let's use a helper function which escrows the payment with
    //         // Zoe, and reallocates to the recipientHandle.
    //         return zoeHelpers
    //           .escrowAndAllocateTo({
    //             amount: tokens1000,
    //             payment,
    //             keyword: 'Token',
    //             recipientHandle: offerHandle,
    //           })
    //           .then(() => {
    //             // Complete the user's offer so that the user gets a payout
    //             zcf.complete(harden([offerHandle]));
      
    //             // Since the user is getting the payout through Zoe, we can
    //             // return anything here. Let's return some helpful instructions.
    //             return 'Offer completed. You should receive a payment from Zoe';
    //           });
    //       };

    //       // A function for making invites to this contract
    //         const makeMintInvite = () => zcf.makeInvitation(offerHook, 'mint a payment');


    //         return harden(
    //             {
    //             invite: zcf.makeInvitation(
    //             checkHook(makeMatchingInvite, firstOfferExpected), 'firstOffer',),
    //             }
    //             // {
    //             //     // return an invite to the creator of the contract instance
    //             //     // through Zoe
    //             //     invite: makeMintInvite(),
    //             //     publicAPI: {
    //             //       // provide a way for anyone who knows the instanceHandle of
    //             //       // the contract to make their own invite.
    //             //       makeMintInvite,
    //             //       // make the token issuer public. Note that only the mint can
    //             //       // make new digital assets. The issuer is ok to make public.
    //             //       getTokenIssuer: () => issuer,
    //             //     },
    //             //   }
            
    //         );
    //     });


  });