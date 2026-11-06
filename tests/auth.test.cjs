const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
process.env.NODE_ENV='production';
const auth=require('../lib/auth');
test('missing configuration rejects default password and token signing',()=>{
 delete process.env.JWT_SECRET; delete process.env.ADMIN_PASSWORD;
 assert.throws(()=>auth.checkPassword('admin123'));
 assert.throws(()=>auth.signToken({admin:true}));
 assert.equal(auth.verifyToken('bad'),null);
});
test('configured authentication accepts valid credentials and rejects tampering and invalid expiry',()=>{
 process.env.JWT_SECRET='test-only-secret-with-at-least-32-bytes'; process.env.ADMIN_PASSWORD='test-only-password';
 assert.equal(auth.checkPassword('test-only-password'),true);
 assert.equal(auth.checkPassword('admin123'),false);
 const token=auth.signToken({admin:true});
 assert.equal(auth.verifyToken(token).admin,true);
 assert.equal(auth.verifyToken(token+'x'),null);
 function signed(payload){const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'); const body=Buffer.from(JSON.stringify(payload)).toString('base64url');return `${header}.${body}.${crypto.createHmac('sha256',process.env.JWT_SECRET).update(`${header}.${body}`).digest('base64url')}`;}
 for(const payload of [{admin:true},{exp:0},{exp:Math.floor(Date.now()/1000)},{exp:'99999999999'}]) assert.equal(auth.verifyToken(signed(payload)),null);
});
