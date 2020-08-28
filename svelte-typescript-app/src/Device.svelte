<script lang="ts">
  import type { DeviceT } from "./types/types";
  import Badge from "./Badge.svelte";

  export let dev: DeviceT;
</script>

<tr>
  <td>
    <a target="_blank" href="https://wiki.lineageos.org/devices/{dev.Model}">
      {dev.Model}
    </a>
  </td>
  <td>
    <Badge period={dev.Period} />
    {#if dev.lineage_recovery}
      <span class="badge badge-info">Recovery</span>
    {/if}
  </td>
  <td>{dev.Branch}</td>
  <td>{dev.Oem}</td>
  <td>{dev.Name}</td>
  <td>
    {#each [...dev.Repos] as [name, repo]}
      <div>
        <a target="_blank" href="https://github.com/LineageOS/{name}">
          <div class="progress" title={name}>
            <div
              class="progress-bar bg-success"
              role="progressbar"
              style="width: {repo.health}%"
              aria-valuenow={repo.health}
              aria-valuemin="0"
              aria-valuemax="100">
              {repo.committersCount}
            </div>
          </div>
        </a>
        {repo.health}%
      </div>
    {/each}
  </td>
  <td />
</tr>
