<template>
  <div
    class="card"
    :class="{ 'card-hover': hover }"
    :style="{ maxHeight }"
    :title="title"
  >
    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hover: {
    type: Boolean,
    default: true,
  },
  maxHeight: {
    type: String,
    default: "none",
  },
  title: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg border border-gray-200 p-4;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #818cf8);
}

.card-content {
  height: 100%;
  overflow-y: auto;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Custom scrollbar for Webkit */
.card-content::-webkit-scrollbar {
  width: 4px;
}

.card-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.card-content::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 2px;
}

/* Custom scrollbar for Firefox */
.card-content {
  scrollbar-width: thin;
  scrollbar-color: #c7d2fe #f1f1f1;
}
</style>
