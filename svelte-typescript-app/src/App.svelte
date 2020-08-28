<script lang="ts">
  import DeviceList from "./DeviceList.svelte";

  let devices: { [index: string]: any };
  let repos: { [index: string]: any };
  let pressed = false;
  let loaded = false;

  let loadData = () => {
    pressed = true;
    fetch("/devices.json")
      .then((s) =>
        s.json().then((t) => {
          devices = t;
          loadRepos();
        })
      )
      .catch(console.log);
  };
  let loadRepos = () => {
    fetch("/repos.json")
      .then((s) =>
        s.json().then((t) => {
          repos = t;
          loaded = true;
        })
      )
      .catch(console.log);
  };
</script>

<main>
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
