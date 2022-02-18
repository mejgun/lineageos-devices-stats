const commitsCount = 100;
const hoursInMonth = 30 * 24;

import type { DeviceT, CommitsT, DeviceListT, RepoListT, FiltersT, RepoInfoT, TotalHPT } from "../types/types";

export let parseDevices = (j: { [index: string]: DeviceT }): DeviceListT => {
    let devices: DeviceListT = new Map();
    for (let k of Object.keys(j)) {
        let d: DeviceT = j[k];
        d.Deps.forEach((s, i, arr) => { arr[i] = s.toLowerCase() });
        devices.set(k, d);
    }
    return devices;
};

export let parseRepos = (j: { [index: string]: any }): RepoListT => {
    let repos: RepoListT = new Map();
    const toHours = 1000 * 60 * 60;
    let now = Date.now();
    for (let k of Object.keys(j)) {
        let el = j[k];
        let t: CommitsT = {
            Authors: el['a'],
            Committers: el['c'],
            Hours: [],
        }
        for (let i in Object.keys(el['t'])) {
            let d = new Date(el['t'][i]);
            let time = Math.round((now - d.getTime()) / toHours);
            t.Hours.push(time);
        }
        repos.set(k.toLowerCase(), t);
        repos = repos;
    }
    return repos;
};

export let calculateHealth = (devices: DeviceListT, repos: RepoListT, max: number): DeviceListT => {
    let min = 999999;
    let setMin = (t: number) => {
        min = Math.min(min, t);
    };
    devices.forEach((v) => {
        v.Deps.forEach((d) => {
            let commits = repos.get(d)
            if (commits) {
                commits.Hours.forEach((commit) => {
                    setMin(commit);
                });
            };
        });
    });
    max = max * hoursInMonth + min;
    devices.forEach((e, k, map) => {
        let w: RepoInfoT = new Map();
        e.Deps.forEach((v,) => {
            let commits = repos.get(v);
            let count = 0;
            let sum = 0;
            let committersCount = 0;
            let authorsCount = 0;
            if (commits) {
                count = commits.Hours.length
                sum = commits.Hours.reduce((y, x) => y + (x > max ? max : x) - min, 0);
                committersCount = commits.Committers;
                authorsCount = commits.Authors;
            }
            if (count < commitsCount) {
                sum = sum + (commitsCount - count) * (max - min);
            }
            sum = sum / commitsCount;
            let percent = (max - min) / 100;
            sum = 100 - Math.round(sum / percent);
            let q = {
                health: sum,
                committersCount: committersCount,
                authorsCount: authorsCount
            };
            w.set(v, q);
        });
        e.Repos = w;
        map.set(k, e);
    });
    return new Map([...devices.entries()]
        .sort(
            ([_a, a], [_b, b]) => {
                if (a.Oem > b.Oem) return 1;
                if (a.Oem == b.Oem) return (a.Name > b.Name ? 1 : -1)
                return -1;
            }
        )
    );
}

export const allSelect = "All"

export let filterDevices = (devices: DeviceListT, filters: FiltersT): DeviceListT => {
    let newD: DeviceListT = new Map();
    devices.forEach((v, k) => {
        if (filters.branch != allSelect && v.Branch != filters.branch) {
            return
        }
        if (filters.oem != allSelect && v.Oem != filters.oem) {
            return
        }
        newD.set(k, v);
    });
    return newD;
}

export let calculateBranches = (devices: DeviceListT): string[] => {
    let branches: string[] = [allSelect];
    devices.forEach((v) => {
        if (!branches.includes(v.Branch) && v.Branch.length > 0) {
            branches.push(v.Branch);
        }
    })
    return branches;
}

export let calculateOems = (devices: DeviceListT, filters: FiltersT): string[] => {
    let oems: string[] = [];
    devices.forEach((v) => {
        if (
            (filters.branch == allSelect || v.Branch == filters.branch)
            && !oems.includes(v.Oem) && v.Oem.length > 0) {
            oems.push(v.Oem);
        }
    })
    oems = oems.sort((a, b) => (a > b ? 1 : -1));
    return [allSelect].concat(oems);
}

export let calculateTotalHP = (dev: DeviceT): TotalHPT => {
    let avg = (x: number): number => Math.round(x / dev.Repos.size);
    let h = 0;
    let a = 0;
    let c = 0;
    dev.Repos.forEach((r) => {
        h += r.health;
        a += r.authorsCount;
        c += r.committersCount;
    });
    return { authors: avg(a), committers: avg(c), health: avg(h) };
};