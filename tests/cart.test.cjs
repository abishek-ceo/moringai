const {test}=require('node:test');
const assert=require('node:assert/strict');
const {priceCart}=require('../lib/products');
test('server catalogue overrides tampered client prices',()=>{
 const priced=priceCart([{name:'Moringa Leaf Powder',variant:'100g',qty:1,price:1}]);
 assert.equal(priced.items[0].price,299);assert.equal(priced.total,348);
});
test('invalid products, variants and nonpositive quantities are rejected',()=>{
 for(const items of [[],[{name:'invalid',variant:'100g',qty:1}],[{name:'Moringa Leaf Powder',variant:'invalid',qty:1}],[{name:'Moringa Leaf Powder',variant:'100g',qty:-1}],[{name:'Moringa Leaf Powder',variant:'100g',qty:0}]]) assert.throws(()=>priceCart(items));
});

test('fractional and malformed quantities are rejected instead of truncated',()=>{
 for(const qty of [1.5,'2junk','2',null,true,Infinity]) assert.throws(()=>priceCart([{name:'Moringa Leaf Powder',variant:'100g',qty}]));
});
