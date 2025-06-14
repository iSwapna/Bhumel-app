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
        contractId: "CCETJECMKOQSSLABSYRI66XSTZNNIGF3Q4N4NB37IYIYRADT62V442XH",
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
            "AAAAAAAAAAAAAAAHY2VydGlmeQAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAEaGFzaAAAABAAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAABAAAD6QAAA+0AAAAAAAAAAw==",
            "AAAAAAAAAAAAAAAGdmVyaWZ5AAAAAAABAAAAAAAAAARoYXNoAAAAEAAAAAEAAAPoAAAABg=="]), options);
        this.options = options;
    }
    fromJSON = {
        certify: (this.txFromJSON),
        verify: (this.txFromJSON)
    };
}
