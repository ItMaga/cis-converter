<template>
  <main class="app">
    <header class="app__header">
      <RouterLink to="/" class="app__logo">
        <img src="@/assets/logo.svg" alt="CI's converter" />
        <h1>CI's converter</h1>
      </RouterLink>
      <RouterLink to="/">Main</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <a
        href="https://github.com/ItMaga/cis-converter"
        rel="noopener noreferrer"
        target="_blank"
      >
        GitHub
      </a>
    </header>

    <RouterView />
  </main>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 0 var(--padding-md);
  min-height: 100vh;
}
.app__header {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  column-gap: 8px;
  align-items: center;
  justify-items: flex-end;
  height: 64px;
}
.app__logo {
  display: flex;
  align-items: center;
  column-gap: 16px;
}
</style>
