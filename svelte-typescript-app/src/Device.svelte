<script lang="ts">
  import type { DeviceT } from "./types/types";
  import Badge from "./Badge.svelte";

  export let dev: DeviceT;
  export let expandRepos: boolean;

  const t = (): { authors: number; committers: number; health: number } => {
    console.log("okay");
    let avg = (x: number): number => Math.round(x / dev.Repos.size);
    let h = 0;
    let a = 0;
    let c = 0;
    dev.Repos.forEach((r) => {
      h += r.health;
      a += r.authorsCount;
      c += r.committersCount;
    });
    return { authors: avg(a), committers: avg(c), health: avg(h) };
  };
  const total = t();
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
      <span class="badge badge-info">Recovery</span>
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
            committers: {repo.committersCount}">
            <div
              class="progress-bar bg-success"
              role="progressbar"
              style="width: {repo.health}%"
              aria-valuenow={repo.health}
              aria-valuemin="0"
              aria-valuemax="100">
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
            aria-valuenow={total.health}
            aria-valuemin="0"
            aria-valuemax="100">
            {total.authors} ({total.committers})
          </div>
        </div>
      </a>
    {/if}
  </td>
  <td />
</tr>
