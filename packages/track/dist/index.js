import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CDCGN7FWYHXTX4H2C4GTX6CAQAOT3JLBSDN7JPAGF66FYTD6U7R4ZSLG",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { admin }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy({ admin }, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
            "AAAAAAAAAAAAAAAGY29tbWl0AAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAADc2hhAAAAABAAAAAA",
            "AAAAAAAAAAAAAAAKZ2V0X2NvbW1pdAAAAAAAAAAAAAEAAAPoAAAAEA=="]), options);
        this.options = options;
    }
    fromJSON = {
        commit: (this.txFromJSON),
        get_commit: (this.txFromJSON)
    };
}
