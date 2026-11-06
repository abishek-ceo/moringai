'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const db = require('../lib/db');
const gateway = require('../lib/razorpay');
const { readRawBody } = require('../lib/utils');
let saved, writes, gatewayOrder, gatewayPayment, failDB, duplicateInsert;
db.createOrder = async order => { writes++; if (duplicateInsert) { saved = order; const e = new Error('duplicate'); e.code='23505'; throw e; } saved=order; return order; };
db.findOrderByPaymentId = async () => { if(failDB) throw new Error('database unavailable'); return saved; };
db.updatePendingOrder = async (id, updates) => { if(failDB) throw new Error('database unavailable'); if(saved.status==='pending') { writes++; saved={...saved,...updates}; } };
gateway.fetchOrder = async () => gatewayOrder;
gateway.fetchPayment = async () => gatewayPayment;
const orders = require('../api/orders/index');
const webhook = require('../api/payments/webhook');
const key = 'test-payment-secret-not-a-real-credential';
const payment = { razorpay_order_id:'order_test123', razorpay_payment_id:'pay_test123' };
payment.razorpay_signature=crypto.createHmac('sha256',key).update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`).digest('hex');
const body = () => ({customer:{name:'Test Buyer',phone:'9999999999',address:'Test address, Chennai 600001'},items:[{name:'Moringa Leaf Powder',variant:'100g',qty:1,price:1}],total:1,paymentMethod:'razorpay',payment:{...payment}});
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(data){this.data=data;return this;},end(){return this;}};}
async function call(handler,body,extra={}){const res=response();await handler({method:'POST',headers:{},body,...extra},res);return res;}
beforeEach(()=>{saved=null;writes=0;failDB=false;duplicateInsert=false;process.env.RAZORPAY_KEY_SECRET=key;process.env.RAZORPAY_KEY_ID='test_key';process.env.RAZORPAY_WEBHOOK_SECRET=key;delete process.env.SMTP_HOST;gatewayOrder={amount:34800,currency:'INR',status:'paid'};gatewayPayment={id:payment.razorpay_payment_id,order_id:payment.razorpay_order_id,amount:34800,currency:'INR',status:'captured'};});
test('online order uses authoritative prices and verifies captured payment before saving',async()=>{const res=await call(orders,body());assert.equal(res.code,201);assert.equal(saved.total,348);assert.equal(saved.items[0].price,299);assert.equal(saved.status,'confirmed');assert.equal(saved.payment.razorpay_signature,undefined);assert.equal(res.data.order.customer,undefined);});
test('invalid signature never saves an online order',async()=>{const b=body();b.payment.razorpay_signature='0'.repeat(64);const r=await call(orders,b);assert.equal(r.code,400);assert.equal(writes,0);});
test('amount, currency, capture and payment-order binding must all match',async()=>{for(const delta of [{amount:1},{currency:'USD'},{status:'authorized'},{order_id:'order_other'},{id:'pay_other'}]){const previous=gatewayPayment;gatewayPayment={...previous,...delta};const r=await call(orders,body());assert.equal(r.code,400,JSON.stringify(delta));assert.equal(writes,0);gatewayPayment=previous;}});
test('sequential payment retries return the same receipt without new orders',async()=>{const first=await call(orders,body());const second=await call(orders,body());assert.equal(second.data.replayed,true);assert.equal(second.data.order.id,first.data.order.id);assert.equal(writes,1);assert.equal(second.data.order.customer,undefined);});
test('concurrent duplicate insert returns existing payment receipt',async()=>{duplicateInsert=true;const r=await call(orders,body());assert.equal(r.code,200);assert.equal(r.data.replayed,true);assert.equal(writes,1);});
test('COD ignores supplied payment metadata and totals',async()=>{const b=body();b.paymentMethod='cod';const r=await call(orders,b);assert.equal(r.code,201);assert.equal(saved.total,348);assert.equal(saved.status,'pending');assert.equal(saved.payment,null);});
test('invalid contact details and payment methods reject before database access',async()=>{for(const change of [{paymentMethod:'free'},{customer:{name:'X',phone:'a',address:'a'}}]){const r=await call(orders,{...body(),...change});assert.equal(r.code,400);assert.equal(writes,0);}});
function eventRaw(){return JSON.stringify({event:'payment.captured',payload:{payment:{entity:gatewayPayment}}},null,2);}
async function sendWebhook(raw,signature){return call(webhook,undefined,{rawBody:Buffer.from(raw),headers:{'x-razorpay-signature':signature||crypto.createHmac('sha256',key).update(raw).digest('hex')}});}
test('webhook refuses missing secret and invalid signatures',async()=>{delete process.env.RAZORPAY_WEBHOOK_SECRET;assert.equal((await sendWebhook(eventRaw())).code,503);process.env.RAZORPAY_WEBHOOK_SECRET=key;assert.equal((await sendWebhook(eventRaw(),'0'.repeat(64))).code,400);assert.equal(writes,0);});
test('valid raw webhook preserves whitespace and confirms only pending matched payments',async()=>{saved={id:'order',total:348,status:'pending',payment_method:'razorpay',payment:{...payment}};const raw=eventRaw();assert.equal((await sendWebhook(raw)).code,200);assert.equal(saved.status,'confirmed');assert.equal(writes,1);assert.equal((await sendWebhook(raw)).code,200);assert.equal(writes,1);});
test('late webhook cannot regress shipped, delivered or cancelled order',async()=>{for(const status of ['shipped','delivered','cancelled']){saved={id:'order',total:348,status,payment_method:'razorpay',payment:{...payment}};await sendWebhook(eventRaw());assert.equal(saved.status,status);}assert.equal(writes,0);});
test('webhook mismatched payment and database failures are not acknowledged as success',async()=>{saved={id:'order',total:1,status:'pending',payment_method:'razorpay',payment:{...payment}};assert.equal((await sendWebhook(eventRaw())).code,400);failDB=true;assert.equal((await sendWebhook(eventRaw())).code,500);assert.equal(writes,0);});
test('raw reader consumes stream before lazy parsed-body getter',async()=>{const raw=' { "event": "test" } ';const req=Readable.from([Buffer.from(raw)]);Object.defineProperty(req,'body',{get(){throw new Error('must not read parsed body');}});assert.equal(await readRawBody(req),raw);});
