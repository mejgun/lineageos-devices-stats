<script lang="ts">
  import type { Device } from "./types/Device";
  import Badge from "./Badge.svelte";

  export let dev: Device;
</script>

<tr>
  <td>
    <a href="https://wiki.lineageos.org/devices/{dev.Model}">{dev.Model}</a>
  </td>
  <td>
    <Badge period={dev.Period} />
  </td>
  <td>{dev.Branch}</td>
  <td>{dev.Oem}</td>
  <td>{dev.Name}</td>
  <td>
    {#if dev.lineage_recovery}
      <span class="badge badge-info">Recovery</span>
    {/if}
  </td>
</tr>
