export type DeviceListT = Map<string, DeviceT>
export type RepoListT = Map<string, CommitT[]>

export interface DeviceT {
    Model: string;
    Period: number;
    Branch: string;
    Oem: string;
    Name: string;
    lineage_recovery: boolean;
    Deps: string[];
    Repos: Map<string, { committersCount: number, health: number }>;
}

export interface CommitT {
    Date: Date;
    Hours: number;
    Name: string;
    Email: string;
}

export interface FiltersT {
    build: boolean;
}