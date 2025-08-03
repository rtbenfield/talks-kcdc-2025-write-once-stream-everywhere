<template>
  <div class="slidev-layout three-columns">
    <div class="title">
      <slot />
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div class="col">
        <slot name="left" />
      </div>
      <div class="col">
        <slot name="center" />
      </div>
      <div class="col">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.three-columns {
  @apply h-full px-14 py-10;

  .title {
    @apply text-4xl font-bold mb-8 text-center;
  }

  .col {
    @apply flex flex-col gap-4;
  }
}
</style>
