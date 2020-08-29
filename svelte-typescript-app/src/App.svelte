<script lang="ts">
  import DeviceList from "./DeviceList.svelte";

  let devices: { [index: string]: any };
  let repos: { [index: string]: any };
  let pressed = false;
  let loaded = false;
  let alerts: string[] = [];

  let loadData = () => {
    pressed = true;
    fetch("/devices.json")
      .then((s) =>
        s
          .json()
          .then((t) => {
            devices = t;
            loadRepos();
          })
          .catch(addAlert)
      )
      .catch(addAlert);
  };
  let loadRepos = () => {
    fetch("/repos.json")
      .then((s) =>
        s
          .json()
          .then((t) => {
            repos = t;
            loaded = true;
          })
          .catch(addAlert)
      )
      .catch(addAlert);
  };
  let addAlert = (s: string) => {
    alerts.push(s);
    alerts = alerts;
  };
</script>

<main>
  {#if alerts}
    {#each alerts as a}
      <div class="alert alert-danger" role="alert">{a}</div>
    {/each}
  {/if}
  {#if loaded}
    <DeviceList deviceList={devices} repoList={repos} />
  {:else}
    <div class="container">
      <button
        disabled={pressed}
        on:click={loadData}
        type="button"
        class="btn btn-primary">
        Load data
      </button>
      <p>{Date()}</p>
    </div>
  {/if}
</main>
