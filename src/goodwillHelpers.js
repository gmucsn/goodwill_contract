import { setup } from '/Users/Shared/repos/smart_contracts/goodwill_contracts/src/setupBasicMints';



export const makeGoodwillHelpers = (zcf) => {
    const {
        moolaIssuer,
        simoleanIssuer,
        moolaMint,
        simoleanMint,
        moola,
        simoleans,
        goodwillIssuer,
        goodwillMint,
        goodwillAmountMath,
    } = setup();
    
    


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

