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
        contractId: "CB4ACEOEL4753V5SYYO7JM2TIZ6VOQ4TBCD5GYB7WD2TX2T4LPO2KXWU",
    }
};
export const Errors = {};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAGY29tbWl0AAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAADc2hhAAAAABAAAAAA",
            "AAAAAAAAAAAAAAAKZ2V0X2NvbW1pdAAAAAAAAAAAAAEAAAPoAAAAEA=="]), options);
        this.options = options;
    }
    fromJSON = {
        commit: (this.txFromJSON),
        get_commit: (this.txFromJSON)
    };
}
