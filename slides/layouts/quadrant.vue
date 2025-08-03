<template>
  <div class="slidev-layout quadrant">
    <header class="header">
      <slot />
    </header>

    <div class="quadrant-grid">
      <div class="quadrant-cell top-left">
        <div class="content">
          <slot name="top-left" />
        </div>
      </div>

      <div class="quadrant-cell top-right">
        <div class="content">
          <slot name="top-right" />
        </div>
      </div>

      <div class="quadrant-cell bottom-left">
        <div class="content">
          <slot name="bottom-left" />
        </div>
      </div>

      <div class="quadrant-cell bottom-right">
        <div class="content">
          <slot name="bottom-right" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.quadrant {
  @apply h-full w-full p-4;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .header {
    @apply text-3xl font-bold mb-4;
  }

  .quadrant-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    height: calc(100% - 4rem);
  }

  .quadrant-cell {
    @apply rounded-lg border border-gray-200 p-4;
    position: relative;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #4f46e5, #818cf8);
    }

    .content {
      height: 100%;
      overflow-y: auto;
      padding-right: 0.5rem;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c7d2fe;
        border-radius: 2px;
      }
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .header {
      @apply text-2xl;
    }

    .quadrant-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, 1fr);
      gap: 0.75rem;
    }

    .quadrant-cell {
      min-height: 200px;

      &::before {
        height: 3px;
      }
    }
  }

  /* Custom scrollbar for Firefox */
  .content {
    scrollbar-width: thin;
    scrollbar-color: #c7d2fe #f1f1f1;
  }
}
</style>
