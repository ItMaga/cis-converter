<template>
  <main class="app">
    <header class="app__header">
      <RouterLink to="/" class="app__logo">
        <img src="@/assets/logo.svg" alt="CI's converter" />
        <h1>CI's converter</h1>
      </RouterLink>
      <RouterLink to="/about">
        <img src="@/assets/about.svg" alt="About" />
      </RouterLink>
      <a
        href="https://github.com/ItMaga/cis-converter"
        rel="noopener noreferrer"
        target="_blank"
      >
        <img src="@/assets/github.svg" alt="GitHub" />
      </a>
      <a href="https://x.com/itmaga0" rel="noopener noreferrer" target="_blank">
        <img src="@/assets/x.svg" alt="X (Twitter)" />
      </a>
      <a
        href="https://linkedin.com/in/itmaga"
        rel="noopener noreferrer"
        target="_blank"
      >
        <img src="@/assets/linkedin.svg" alt="LinkedIn" />
      </a>
    </header>

    <section class="app__content">
      <RouterView />
    </section>
  </main>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}
.app__header {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  column-gap: 16px;
  padding: 0 var(--padding-md);
  align-items: center;
  justify-items: flex-end;
  height: 64px;
  box-shadow: var(--shadow-header);
}
.app__logo {
  display: flex;
  align-items: center;
  column-gap: 16px;
}
.app__content {
  padding: var(--padding-md);
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
