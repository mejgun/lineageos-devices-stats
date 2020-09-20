export type DeviceListT = Map<string, DeviceT>
export type RepoListT = Map<string, CommitsT>

export interface DeviceT {
    Model: string;
    Period: number;
    Branch: string;
    Oem: string;
    Name: string;
    lineage_recovery: boolean;
    Deps: string[];
    Repos: RepoInfoT;
}

export type RepoInfoT = Map<string, {
    authorsCount: number,
    committersCount: number,
    health: number
}>

export interface CommitsT {
    Hours: number[];
    Authors: number;
    Committers: number;
}

export interface FiltersT {
    build: boolean;
    branch: string;
    oem: string;
}

export interface TotalHPT {
    authors: number;
    committers: number;
    health: number;
}