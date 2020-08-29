<script lang="ts">
  // import Device from "./Device.svelte";
  import type { DeviceT, DeviceListT, FiltersT } from "./types/types";
  import {
    parseRepos,
    parseDevices,
    calculateHealth,
    filterDevices,
  } from "./logic/logic";
  import Device from "./Device.svelte";
  import Filters from "./Filters.svelte";

  export let deviceList: { [index: string]: DeviceT };
  export let repoList: { [index: string]: any };
  let filtered: DeviceListT;

  let filters: FiltersT = {
    build: false,
  };

  const devices = parseDevices(deviceList);
  const repos = parseRepos(repoList);
  $: {
    filtered = calculateHealth(filterDevices(devices, filters), repos);
    console.log(devices);
  }
</script>

<Filters bind:value={filters} />

<table class="table table-dark">
  <thead>
    <tr>
      <th scope="col">Code</th>
      <th scope="col">Build</th>
      <th scope="col">Branch</th>
      <th scope="col">OEM</th>
      <th scope="col">Model</th>
      <th style="width: 200px;" scope="col">Repos</th>
    </tr>
  </thead>
  <tbody>
    {#each [...filtered] as [, dev]}
      <Device {dev} />
    {/each}
  </tbody>
</table>
