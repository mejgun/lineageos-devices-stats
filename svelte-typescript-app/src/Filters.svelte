<script lang="ts">
  import type { FiltersT } from "./types/types";
  export let value: FiltersT;
  export let branches: string[];
  export let oems: string[];
</script>

<thead>
  <tr>
    <th scope="col">Code</th>
    <th scope="col">
      Build
      <input type="checkbox" bind:checked={value.build} />
    </th>
    <th scope="col">
      Branch
      <select bind:value={value.branch}>
        {#each branches as b}
          <option value={b}>{b}</option>
        {/each}
      </select>
    </th>
    <th scope="col">
      OEM
      <select bind:value={value.oem}>
        {#each oems as o}
          <option value={o}>{o}</option>
        {/each}
      </select>
    </th>
    <th scope="col">Model</th>
    <th scope="col" style="width: 25%">Repos</th>
  </tr>
</thead>
