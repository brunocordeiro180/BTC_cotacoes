const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex();
 
// poloniex.returnTicker(function (err, ticker) {
//   if (err) {
//     console.log(err.message);
//   } else {
//     console.log(ticker);
//   }
// });

// poloniex.returnLoanOrders('BTC', null, (err, loanOrders) => {
//   if (err) {
//     console.log(err.message);
//   } else {
//     console.log(loanOrders);
//   }
// });

poloniex.returnBalances(function (err, balances) {
  if (err) {
    console.log(err.message);
  } else {
    console.log(balances);
  }
});