const commitsCount = 100;

import type { DeviceT, CommitT, DeviceListT, RepoListT, FiltersT } from "../types/types";

export let parseDevices = (j: { [index: string]: DeviceT }): DeviceListT => {
    let devices: DeviceListT = new Map();
    for (let k of Object.keys(j)) {
        let d: DeviceT = j[k];
        devices.set(k, d);
    }
    return devices;
};

export let parseRepos = (j: { [index: string]: any }): RepoListT => {
    let repos = new Map<string, CommitT[]>();
    const toHours = 1000 * 60 * 60;
    let now = Date.now();
    for (let k of Object.keys(j)) {
        let t: CommitT[] = [];
        for (let i in Object.keys(j[k])) {
            let e = j[k];
            let temp = e[i]["commit"]["committer"];
            let d = new Date(e[i]["commit"]["committer"]["date"]);
            let time = Math.round((now - d.getTime()) / toHours);
            temp["Hours"] = time;
            temp["Date"] = d;
            t.push(temp);
        }
        repos.set(k.toLowerCase(), t);
        repos = repos;
    }
    return repos;
};

export let calculateHealth = (devices: DeviceListT, repos: Map<string, CommitT[]>): DeviceListT => {
    let max = 0;
    let min = 999999;
    let setMinMaxTime = (t: number) => {
        min = Math.min(min, t);
        max = Math.max(max, t);
    };
    devices.forEach((v) => {
        v.Deps.forEach((d) => {
            let commits = repos.get(d)
            if (commits) {
                commits.forEach((commit) => {
                    setMinMaxTime(commit.Hours);
                });
            };
        });
    });
    devices.forEach((e, k, map) => {
        let w = new Map();
        e.Deps.forEach((v,) => {
            let commits = repos.get(v);
            let count = 0;
            let sum = 0;
            let committersCount: number = 0;
            if (commits) {
                count = commits.length
                let numbers = commits.map((x) => x.Hours);
                sum = numbers.reduce((y, x) => x + y - min, 0);
                committersCount = new Set(commits.map((x) => x.Email)).size;
            }
            if (count < commitsCount) {
                sum = sum + (commitsCount - count) * (max - min);
            }
            sum = sum / commitsCount;
            let percent = (max - min) / 100;
            sum = 100 - Math.round(sum / percent);
            // console.log(v, sum);
            let q = { health: sum, committersCount: committersCount };
            w.set(v, q);
        });
        e.Repos = w;
        map.set(k, e);
    });
    return devices;
}

export let filterDevices = (devices: DeviceListT, filters: FiltersT): DeviceListT => {
    let newD: DeviceListT = new Map();
    console.log("filtering");
    devices.forEach((v, k) => {
        if (filters.build && v.Period == 0) {
            return
        }
        newD.set(k, v);
    });
    return newD;
}