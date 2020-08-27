"use strict";
let div1 = document.getElementById('devices');
let div2 = document.getElementById('repos');
let setDevices = (d, s) => {
    if (d) {
        let devices = new Map();
        let j = JSON.parse(s);
        for (let k of Object.keys(j)) {
            devices.set(k, j[k]);
        }
        devices.forEach(e => {
            let deps = e.Deps ? e.Deps : [];
            d.innerHTML = d.innerHTML.concat(e.Name, " ", deps.join(","), "<br/>");
        });
    }
};
let setRepos = (d, s) => {
    if (d) {
        let repos = new Map();
        let j = JSON.parse(s);
        for (let k of Object.keys(j)) {
            let t = [];
            for (let i of Object.keys(j[k])) {
                let e = j[k];
                let temp = e[i]['commit']['committer'];
                temp['date'] = new Date(e[i]['commit']['committer']['date']);
                t.push(temp);
            }
            repos.set(k.toLowerCase(), t);
        }
        for (const [k, v] of repos) {
            d.innerHTML = d.innerHTML.concat(k, " ", v.length.toString(), "<br/>");
        }
    }
};
fetch('/devices.json').then((s) => s.text().then((t) => setDevices(div1, t))).catch(console.log);
fetch('/repos.json').then((s) => s.text().then((t) => setRepos(div2, t))).catch(console.log);
