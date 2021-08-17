<script lang="ts">
  export let period: number;
</script>

{#if period == 1}
  <span class="badge bg-success">Monthly</span>
{:else if period == 2}
  <span class="badge bg-success">Weekly</span>
{:else if period == 3}
  <span class="badge bg-success">Nightly</span>
{:else}
  <span class="badge bg-warning">Never</span>
{/if}
