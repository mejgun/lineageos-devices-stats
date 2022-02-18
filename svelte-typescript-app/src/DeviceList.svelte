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
    oem: allSelect,
    branch: allSelect,
  };
  let expandRepos = false;
  let maxHoursTime = 12;

  const devices = parseDevices(deviceList);
  const repos = parseRepos(repoList);
  $: filtered = calculateHealth(
    filterDevices(devices, filters),
    repos,
    maxHoursTime
  );
</script>

<div class="container">
  <div class="row align-items-center">
    <div class="col">
      <label>
        Max commit time (month)
        <input
          type="number"
          name="quantity"
          min="1"
          max="60"
          bind:value={maxHoursTime}
          class="form-control w-50"
        />
        <input
          class="form-range"
          type="range"
          bind:value={maxHoursTime}
          min="1"
          max="60"
        />
      </label>
    </div>
    <div class="col">
      <label>
        Expand repos
        <input
          class="form-check-input"
          type="checkbox"
          bind:checked={expandRepos}
        />
      </label>
    </div>
  </div>
</div>

<table class="table table-dark table-striped">
  <Filters
    bind:value={filters}
    branches={calculateBranches(devices)}
    oems={calculateOems(devices, filters)}
  />
  <tbody>
    {#each [...filtered] as [_, dev]}
      <Device {dev} {expandRepos} />
    {/each}
  </tbody>
</table>
