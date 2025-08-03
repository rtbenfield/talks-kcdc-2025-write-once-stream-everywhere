<template>
  <div class="slidev-layout overlapping-columns">
    <header class="header">
      <slot />
    </header>
    <div class="grid-container">
      <!-- Top-left column -->
      <div class="column top-left">
        <slot name="top-left" />
      </div>

      <!-- Center column -->
      <div class="column center">
        <slot name="center" />
      </div>

      <!-- Bottom-right column -->
      <div class="column bottom-right">
        <slot name="bottom-right" />
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.overlapping-columns {
  @apply h-full w-full p-4 pt-2;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .header {
    @apply text-3xl font-bold mb-4;
  }

  .grid-container {
    @apply h-full w-full;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(12, 1fr);
    gap: 1rem;
    position: relative;
  }

  p {
    @apply m-0;
  }

  .column {
    min-width: 200px;
    max-height: 90vh;
    overflow: hidden;
  }

  .top-left {
    grid-column: 1 / span 7;
    grid-row: 1 / span 6;
    align-self: start;
    justify-self: start;
  }

  .center {
    grid-column: 4 / span 6;
    grid-row: 3 / span 6;
    z-index: 10;
    align-self: center;
  }

  .bottom-right {
    grid-column: 7 / span 5;
    grid-row: 7 / span 5;
    align-self: end;
    justify-self: end;
  }

  /* Add some responsive behavior */
  @media (max-width: 768px) {
    .header {
      @apply text-2xl;
    }

    .grid-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .column {
      width: 100%;
      max-width: 100%;
      max-height: none;
      margin: 0.5rem 0;
      overflow: visible;
    }
  }
}
</style>
