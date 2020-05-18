import harden from '@agoric/harden';

import { makeZoeHelpers } from '@agoric/zoe/src/contractSupport';

export const makeContract = harden(
  zcf => {
    const { swap, assertKeywords, checkHook } = makeZoeHelpers(zcf);
    assertKeywords(harden(['Asset', 'Price', 'Goodwill']));

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
            goodwill: want.Goodwill,
          },
        }),
      );
    };

    const firstOfferExpected = harden({
      give: { Asset: null },
      want: { Price: null, Goodwill: null },
    });

    return harden({
      invite: zcf.makeInvitation(
        checkHook(makeMatchingInvite, firstOfferExpected),
        'firstOffer',
      ),
    });
  },
);