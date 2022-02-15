<script lang="ts">
  import type { DeviceT } from "./types/types";
  import Badge from "./Badge.svelte";
  import { calculateTotalHP } from "./logic/logic";

  export let dev: DeviceT;
  export let expandRepos: boolean;

  $: total = calculateTotalHP(dev);
</script>

<tr>
  <td>
    <a target="_blank" href="https://wiki.lineageos.org/devices/{dev.Model}">
      {dev.Model}
    </a>
  </td>
  <td>
    <a target="_blank" href="https://download.lineageos.org/{dev.Model}">
      <Badge period={dev.Period} />
    </a>
    {#if dev.lineage_recovery}
      <span class="badge bg-info text-dark">Recovery</span>
    {/if}
  </td>
  <td>{dev.Branch}</td>
  <td>{dev.Oem}</td>
  <td>{dev.Name}</td>
  <td>
    {#if expandRepos}
      {#each [...dev.Repos] as [name, repo]}
        <a target="_blank" href="https://github.com/LineageOS/{name}">
          <div
            class="progress"
            title="{name} ({repo.health}%) unique authors: {repo.authorsCount}
            committers: {repo.committersCount}"
          >
            <div
              class="progress-bar progress-bar-striped bg-success"
              role="progressbar"
              style="width: {repo.health}%"
            >
              {repo.authorsCount} ({repo.committersCount})
            </div>
          </div>
        </a>
      {/each}
    {:else}
      <a href="##" on:click={() => (expandRepos = !expandRepos)}>
        <div class="progress">
          <div
            class="progress-bar bg-success"
            role="progressbar"
            style="width: {total.health}%"
          >
            {total.authors} ({total.committers})
          </div>
        </div>
      </a>
    {/if}
  </td>
  <td />
</tr>
