<script lang="ts">
  // import Device from "./Device.svelte";
  import type { DeviceT } from "./types/types";
  import { parseRepos, parseDevices, calculateHealth } from "./logic/logic";
  import Device from "./Device.svelte";

  export let deviceList: { [index: string]: DeviceT };
  export let repoList: { [index: string]: any };

  // let calculateHealth = (repos: Map<string, CommitT[]>) => {};

  let devices = parseDevices(deviceList);
  let [repos, minTime, maxTime] = parseRepos(repoList);
  devices = calculateHealth(devices, repos, minTime, maxTime);
  console.log(devices);
</script>

<table class="table table-striped">
  <thead>
    <tr>
      <th scope="col">Code</th>
      <th scope="col">Build</th>
      <th scope="col">Branch</th>
      <th scope="col">OEM</th>
      <th scope="col">Model</th>
      <th scope="col">Repos</th>
    </tr>
  </thead>
  <tbody>
    {#each [...devices] as [, dev]}
      <Device {dev} />
    {/each}
  </tbody>
</table>
