var CoinMarketCap = require("node-coinmarketcap");
var coinmarketcap = new CoinMarketCap();
// If you want to check a single coin, use get() (You need to supply the coinmarketcap id of the cryptocurrency, not the symbol)
// If you want to use symbols instead of id, use multi.
coinmarketcap.get("bitcoin", coin => {
  console.log(coin); // Prints the price in USD of BTC at the moment.
});
// If you want to check multiple coins, use multi():
// coinmarketcap.multi(coins => {
//   console.log(coins.get("BTC").price_usd); // Prints price of BTC in USD
//   console.log(coins.get("ETH").price_usd); // Print price of ETH in USD
//   console.log(coins.get("ETH").price_btc); // Print price of ETH in BTC
//   console.log(coins.getTop(10)); // Prints information about top 10 cryptocurrencies
// });