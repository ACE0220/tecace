interface TypeData {
    packages?: Array<string>;
    protos?: Array<string>;
    types?: Array<string>;
}
export declare function scanProtos(): TypeData;
declare class ProtosLoader {
    private datas;
    private static instance;
    static getInstance(): ProtosLoader;
    constructor();
    getTypes(): string[];
    getProtos(): string[];
    getPackages(): string[];
}
export declare const protosLoader: ProtosLoader;
export {};
