<script>
import { ref, computed } from 'vue';
import { theme } from 'ant-design-vue';
import MapComponent from './components/MapComponent.vue';
export default {
  name: 'App',
  components: { MapComponent },
  setup() {
    const isDarkTheme = ref(false);

    const selectedTheme = computed(() => {
      return isDarkTheme.value ? theme.darkAlgorithm : theme.defaultAlgorithm;
    });

    const backgroundColor = computed(() => {
      return isDarkTheme.value ? '#001524' : '#F6F1EE';
    });

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value;
    };
    return { selectedTheme, toggleTheme, backgroundColor, isDarkTheme };
  },
};
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  display: flex;
  flex-direction: column;
}
.home-container {
  flex-grow: 1;
  width: 100%;
  height: auto;
  padding: 5em;
  display: flex;
  flex-direction: column;
}
.map-container {
  width: 100%;
  height: 40vh;
}
@media screen and (max-width: 768px) {
  #app {
    font-size: 6px;
  }
  .map-container {
    width: 100%;
  }
}
</style>

<template>
  <a-config-provider
    :theme="{ token: { colorPrimary: '#ED7D31' }, algorithm: selectedTheme }"
  >
    <div class="home-container" :style="{ background: backgroundColor }">
      <div>
        <a-row justify="start" align="middle" :gutter="32">
          <a-col>
            <a-typography>
              <a-typography-title style="margin: 0"
                >Accuenergy Map App</a-typography-title
              >
            </a-typography></a-col
          ><a-col><a-button @click="toggleTheme">Toggle Theme</a-button></a-col>
        </a-row>
        <a-row><MapComponent :isDarkTheme="isDarkTheme" /></a-row>
      </div>
    </div>
  </a-config-provider>
</template>
