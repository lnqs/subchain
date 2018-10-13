import { expect } from 'chai';
import * as msgpack from 'msgpack';
import { Blockchain } from './index';

interface Data {
  number: number;
  string: string;
}

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAwVUmI5OZarrAxLc7
yGd1JY11dov1NJNGjrxA3I+4hQaazpa1/Ntg65eQ+hK2co8Fibt0cLeIfLfCiCMJ
K9Rz1wIDAQABAkEAi9W0skLN0n6lcyM9IGSEPNcmQMpWXuKvRAoxt9ZUFhJAqzw+
HUS30XPW9bym+Wi+D7XK1aJgNk0I+4yG5olDUQIhAOm19JzOfbt1sgW+xAqHxjNQ
FdDqK2NFwRFqWR0wlDj7AiEA08VckERwZDLValgdxUGpCTj9K0SLne+5CBApBjN7
MdUCIH2wu+NxMjGVNK7eT7SSHMgP9AutRLRZGWJyXYbTT4PtAiBIQJYMQs114kIe
PmIp4vUhSGhYUtKv2BJxRdI5Y2cs4QIgOe8WFGzpSqCaawJGYIpjW/nNe0+fSUIV
GTTvwDHPxWE=
-----END PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMFVJiOTmWq6wMS3O8hndSWNdXaL9TST
Ro68QNyPuIUGms6WtfzbYOuXkPoStnKPBYm7dHC3iHy3wogjCSvUc9cCAwEAAQ==
-----END PUBLIC KEY-----`;

describe('Blockchain', () => {
  it('adds new blocks and provides the attached data', () => {
    const blockchain = new Blockchain<Data>();
    expect(blockchain.head).to.deep.equal({});

    blockchain.add({ number: 42 }, publicKey, privateKey);
    expect(blockchain.head).to.deep.equal({ number: 42 });

    blockchain.add({ string: 'Hi There!' }, publicKey, privateKey);
    expect(blockchain.head).to.deep.equal({ number: 42, string: 'Hi There!' });
  });

  it('serializes and loads', () => {
    let blockchain = new Blockchain<Data>();

    blockchain.add({ number: 42 }, publicKey, privateKey);
    blockchain.add({ string: 'Hi There!' }, publicKey, privateKey);

    const serialized = blockchain.serialize();

    blockchain = new Blockchain<Data>(serialized);
    expect(blockchain.head).to.deep.equal({ number: 42, string: 'Hi There!' });
  });

  it('fails to verify for invalid chain data', () => {
    expect(() => new Blockchain<Data>(Buffer.from('Invalid data'))).to.throw();
  });

  it('fails to verify for invalid signature', () => {
    const blockchain = new Blockchain<Data>();

    blockchain.add({ number: 42 }, publicKey, privateKey);
    blockchain.add({ string: 'Hi There!' }, publicKey, privateKey);
    blockchain.add({ number: 23 }, publicKey, privateKey);

    const block1 = msgpack.unpack((blockchain as any).blocks[1]);
    const block2 = msgpack.unpack((blockchain as any).blocks[2]);
    block2.signaturePrev = block1.signaturePrev;
    (blockchain as any).blocks[2] = msgpack.pack(block2);

    expect(() => blockchain.verify()).to.throw();
  });

  it('fails to verify for invalid block data', () => {
    const blockchain = new Blockchain<Data>();

    blockchain.add({ number: 42 }, publicKey, privateKey);
    blockchain.add({ string: 'Hi There!' }, publicKey, privateKey);
    blockchain.add({ number: 23 }, publicKey, privateKey);

    (blockchain as any).blocks[2] = msgpack.pack({ something: 'completely different'});

    expect(() => blockchain.verify()).to.throw();
  });
});
