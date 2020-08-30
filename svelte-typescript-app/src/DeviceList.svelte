<script lang="ts">
  // import Device from "./Device.svelte";
  import type { DeviceT, DeviceListT, FiltersT } from "./types/types";
  import {
    parseRepos,
    parseDevices,
    calculateHealth,
    filterDevices,
    calculateOems,
    calculateBranches,
    allSelect,
  } from "./logic/logic";
  import Device from "./Device.svelte";
  import Filters from "./Filters.svelte";

  export let deviceList: { [index: string]: DeviceT };
  export let repoList: { [index: string]: any };
  let filtered: DeviceListT;
  let filters: FiltersT = {
    build: false,
    oem: allSelect,
    branch: allSelect,
  };
  let expandRepos = false;

  const devices = parseDevices(deviceList);
  const repos = parseRepos(repoList);
  $: filtered = calculateHealth(filterDevices(devices, filters), repos);
</script>

<label>
  Expand repos
  <input type="checkbox" bind:checked={expandRepos} />
</label>

<table class="table table-dark">
  <Filters
    bind:value={filters}
    branches={calculateBranches(devices)}
    oems={calculateOems(devices)} />
  <tbody>
    {#each [...filtered] as [, dev]}
      <Device {dev} {expandRepos} />
    {/each}
  </tbody>
</table>
