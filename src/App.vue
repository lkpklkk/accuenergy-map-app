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

    // TODO: change to more appropriate color
    const backgroundColor = computed(() => {
      return isDarkTheme.value ? '#001524' : '#F6F1EE';
    });

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value;
    };
    return { selectedTheme, toggleTheme, backgroundColor };
  },
};
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
}
.home-container {
  width: 100%;
  height: 100vh;
  padding: 5rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
}
.map-container {
  width: 100%;
  height: 30rem;
}
</style>

<template>
  <a-config-provider
    :theme="{ token: { colorPrimary: '#ED7D31' }, algorithm: selectedTheme }"
  >
    <div class="home-container" :style="{ background: backgroundColor }">
      <div>
        <a-row justify="space-between"
          ><a-col>
            <a-typography>
              <a-typography-title
                >Accuenergy Map App</a-typography-title
              ></a-typography
            ></a-col
          ><a-col><a-button @click="toggleTheme">Toggle Theme</a-button></a-col>
        </a-row>
        <a-row><MapComponent :isDarkTheme="isDarkTheme"></MapComponent></a-row>
      </div>
    </div>
  </a-config-provider>
</template>
