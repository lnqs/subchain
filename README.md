<p align="center">
  <img src="https://github.com/lnqs/subchain/raw/master/resources/subchain.png" height="180">
</p>
<p align="right">
  <img src="https://travis-ci.org/lnqs/subchain.svg?branch=master">
  <img src="https://coveralls.io/repos/github/lnqs/subchain/badge.svg?branch=master">
  <img src="https://badge.fury.io/js/subchain.svg">
  <img src="https://david-dm.org/lnqs/subchain.svg">
</p>

# Subchain

You've had a great idea for a software project, but nobody takes it serious
because you're not using the latest shit aka blockchain technology?

Don't dispair, Subchain is here to help! Just include it on your project, use
it to save some data nobody needs, and you call tell everyone you're on the
blockchain!

## Installation
Just install the package from npm:

```
npm install --save subchain
```

Type definitions for usage with TypeScript are already included.

## Usage
Import the package:

```javascript
var subchain = require('subchain');
```

Now you can create an empty blockchain and fill it with blocks:

```javascript
var blockchain = new subchain.Blockchain();
blockchain.add({ number: 23, string: 'incredible' }, publicKey, privateKey);
blockchain.add({ number: 42 }, publicKey, privateKey);
```

The `privateKey` and `publicKey` parameters need to contain the private/public key
used for the cryptographic singing of blocks.
You can create these keys, for example, with `openssl`:

```
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private.pem -out public.pem
```

A snapshot of the blockchains data can be retrieved with the `head` getter.
This includes all data ever passed to the chain, while keys included on newer blocks
overwrite those of older ones:

```javascript
blockchain.head; // => { number: 42, string: 'incredible' }
```

You can verify the integrity of the chain at any time with the `verify()` method,
which throws an exception if the validation fails.

```javascript
blockchain.verify();
```

To serialize the blockchain, just call:

```javascript
var serialized = blockchain.serialize();
```

This returns a `Buffer` you can write to disk, send over the wire, print out,
our whatever you want to to with it.

To recreate the `Blockchain` instance from a serialized one, just pass it to the constructor:

```javascript
var blockchain = new subchain.Blockchain(serialized);
```

## Contributing
You want to make Subchain even greater as it is already? Spendid!
I'd love to see pull requests for this incredible piece of software!

