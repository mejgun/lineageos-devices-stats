<script lang="ts">
  export let name: string;
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  <h1>He11o {name}!</h1>
  <p>
    Visit the
    <a href="https://svelte.d111ev/tutorial">Svelte tutorial</a>
    to learn how to build Svelte apps.
  </p>
  <p>
    Visit the Visit the Visit the Visit the Visit the Visit the Visit the Visit
    Visit the Visit the Visit the Visit the Visit the Visit the Visit the Visit
    Visit the Visit the Visit the Visit the Visit the Visit the Visit the Visit
    the
    <a href="https://svelte.dev/tutorial">Svelte tutorial</a>
    to learn how to build Svelte apps.
  </p>
</main>
