<script lang="ts">
  import DeviceScreen from "./Device.svelte";
  import type { Device } from "./types/Device";

  interface Commit {
    Date: Date;
    Hours: number;
    Name: string;
    Email: string;
  }

  let devices = new Map<string, Device>();
  let repos = new Map<string, Commit[]>();

  let maxTime = 0;
  let minTime = 0;

  let loadData = () => {
    fetch("/devices.json")
      .then((s) => s.text().then((t) => setDevices(t)))
      .catch(console.log);
  };

  let loadRepos = () => {
    fetch("/repos.json")
      .then((s) => s.text().then((t) => setRepos(t)))
      .catch(console.log);
  };

  let setDevices = (s: string) => {
    let j = JSON.parse(s);
    for (let k of Object.keys(j)) {
      let d: Device = j[k];
      d.Deps = d.Deps ? d.Deps : [];
      devices.set(k, d);
      devices = devices;
    }
    console.log(devices);
    loadRepos();
  };

  let setRepos = (s: string) => {
    const toHours = 1000 * 60 * 60;
    let now = Date.now();
    let j = JSON.parse(s);
    for (let k of Object.keys(j)) {
      let t: Commit[] = [];
      for (let i of Object.keys(j[k])) {
        let e = j[k];
        let temp = e[i]["commit"]["committer"];
        let d = new Date(e[i]["commit"]["committer"]["date"]);
        let time = Math.round((now - d.getTime()) / toHours);
        temp["Hours"] = time;
        temp["Date"] = d;
        t.push(temp);
        setMinMaxTime(time);
      }
      repos.set(k.toLowerCase(), t);
      repos = repos;
    }
  };

  let setMinMaxTime = (t: number) => {
    minTime = Math.min(minTime, t);
    maxTime = Math.max(maxTime, t);
  };
</script>

{#if devices.size}
  <table class="table table-striped">
    <thead>
      <tr>
        <th scope="col">Code</th>
        <th scope="col">Build</th>
        <th scope="col">Branch</th>
        <th scope="col">OEM</th>
        <th scope="col">Model</th>
        <th scope="col">Recovery</th>
      </tr>
    </thead>
    <tbody>
      {#each [...devices] as [, dev]}
        <DeviceScreen {dev} />
      {/each}
    </tbody>
  </table>
{:else}
  <button on:click={loadData} type="button" class="btn btn-primary">
    Load data
  </button>
  <h1>{Date()}</h1>
{/if}
<!-- 
{#each [...repos] as [name, commits]}
  <p>{name} {commits.length}</p>
{/each} -->
