<template>
  <button class="l-button" :class="buttonTypeClassname">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
import { computed, defineProps, withDefaults } from 'vue';
import '../styles'
defineOptions({
  name: 'LButton'
});

type TypeLButtonProps = {
  type?: string
};

const buttonProps = withDefaults(defineProps<TypeLButtonProps>(), {
  type: 'default'
});
const buttonTypeClassname = computed(() => {
  return { [`l-button--${buttonProps.type}`]: buttonProps.type };
});

</script>