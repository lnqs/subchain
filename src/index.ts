import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as msgpack from 'msgpack';

interface Block<T> {
  timestamp: number;
  creator: string;
  signaturePrev: Buffer;
  data: Partial<T>;
}

export class Blockchain<T> {
  private readonly blocks: Buffer[] = [];
  private data: Partial<T> = {};

  public constructor(data?: Buffer) {
    if (data) {
      this.blocks = msgpack.unpack(data);

      if (!_.isArray(this.blocks)) {
        throw new Error('Invalid blockchain data');
      }

      this.verify();

      for (const block of this.blocks) {
        this.data = _.merge(this.data, msgpack.unpack(block).data);
      }
    }
  }

  public add(data: Partial<T>, publicKey: string, privateKey: string) {
    const block = msgpack.pack({
      timestamp: Math.floor(new Date().getTime() / 1000.0),
      creator: publicKey,
      signaturePrev: this.blocks.length ? this.sign(this.blocks[this.blocks.length - 1], privateKey) : Buffer.alloc(0),
      data,
    } as Block<T>);

    this.blocks.push(block);
    this.data = _.merge(this.data, data);
  }

  public get head() {
    return _.cloneDeep(this.data);
  }

  public verify() {
    for (let i = 0; i < this.blocks.length - 1; i++) {
      const current = this.blocks[i];
      const next = this.blocks[i + 1];

      const verify = crypto.createVerify('SHA256');
      verify.write(current);

      const valid = verify.verify(msgpack.unpack(current).creator, msgpack.unpack(next).signaturePrev);
      if (!valid) {
        throw new Error(`Blockchain invalid at block #${i}`);
      }
    }
  }

  public serialize() {
    return msgpack.pack(this.blocks);
  }

  private sign(data: Buffer, privateKey: string) {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(privateKey);
  }
}
