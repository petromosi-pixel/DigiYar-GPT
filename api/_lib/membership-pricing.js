'use strict';
const PLANS=Object.freeze({professional:199000,commercial:499000});
const DISCOUNTS=Object.freeze({1:0,3:8,6:15,9:21,12:28});
function calculateMembershipPrice(planId,months){
 const monthly=PLANS[planId],discount=DISCOUNTS[Number(months)];
 if(!monthly||!discount&&Number(months)!==1)throw new Error('invalid_plan_or_duration');
 const count=Number(months);
 if(!Number.isInteger(count)||!Object.prototype.hasOwnProperty.call(DISCOUNTS,count))throw new Error('invalid_plan_or_duration');
 const baseToman=monthly*count;
 const amountToman=Math.round(baseToman*(100-discount)/100);
 if(!Number.isSafeInteger(amountToman)||amountToman<=0)throw new Error('invalid_amount');
 return Object.freeze({planId,months:count,discountPercent:discount,baseToman,amountToman,amountRial:amountToman*10});
}
module.exports={PLANS,DISCOUNTS,calculateMembershipPrice};
