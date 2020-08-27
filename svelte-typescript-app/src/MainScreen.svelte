<script lang="ts">
  interface Device {
    Model: string;
    Period: number;
    Branch: string;
    Oem: string;
    Name: string;
    Lineage_recovery: boolean;
    Deps: string[] | null;
  }

  interface Commit {
    Date: Date;
    Time: number;
    Name: string;
    Email: string;
  }

  let devices = new Map<string, Device>();
  let repos = new Map<string, Commit[]>();

  let loadData = () => {
    fetch("/devices.json")
      .then((s) => s.text().then((t) => setDevices(t)))
      .catch(console.log);
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
        temp["Time"] = Math.round((now - d.getTime()) / toHours);
        temp["Date"] = d;
        t.push(temp);
      }
      repos.set(k.toLowerCase(), t);
      repos = repos;
    }
  };

  let re: Commit[];
  $: {
    let t = repos.get("android_device_yandex_amber");
    if (t) {
      re = t;
    } else {
      re = [];
    }
    console.log(re);
  }
</script>

<button on:click={loadData}>Load data</button>
<!-- {#each [...devices] as [name, dev]}
  <p>{name} {dev.Name}</p>
{/each}-->
{#each [...repos] as [name, commits]}
  <p>{name} {commits.length}</p>
{/each}

{#each re as r}
  <p>{r.Time}</p>
{/each}
