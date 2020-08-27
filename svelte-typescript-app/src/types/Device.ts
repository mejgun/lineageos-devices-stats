export interface Device {
    Model: string;
    Period: number;
    Branch: string;
    Oem: string;
    Name: string;
    lineage_recovery: boolean;
    Deps: string[] | null;
}
