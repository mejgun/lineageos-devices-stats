<script lang="ts">
  export let period: number;
</script>

{#if period == 1}
  <span class="badge badge-success">Monthly</span>
{:else if period == 2}
  <span class="badge badge-success">Weekly</span>
{:else if period == 3}
  <span class="badge badge-success">Nightly</span>
{:else}
  <span class="badge badge-warning">Never</span>
{/if}
