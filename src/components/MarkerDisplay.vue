<script>
import { ref } from 'vue';
import MarkerItem from './MarkerItem.vue';
export default {
  name: 'MarkerDisplay',
  props: {
    markers: Array,
    onDelete: Function,
    onClickMarkerItem: Function,
  },
  components: {
    MarkerItem,
  },
  data() {
    return {
      selectedMarkers: [],
      displayingMarkers: ref([]),
      currentPage: 1,
      pageSize: 5,
    };
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page;
    },
    displayedMarkers() {
      if (this.markers.length <= this.pageSize) {
        return this.markers;
      }
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.markers.slice(start, end);
    },
    generateMakerKey(marker) {
      return marker.getPosition().lat() + marker.getPosition().lng();
    },
    selectMarker(marker) {
      if (this.selectedMarkers.includes(marker)) {
        this.selectedMarkers = this.selectedMarkers.filter(
          (selectedMarker) => selectedMarker !== marker
        );
      } else {
        console.log('adding', marker);
        this.selectedMarkers.push(marker);
      }
    },
    handleDelete() {
      this.onDelete(this.selectedMarkers);
      this.selectedMarkers = [];
    },
  },
};
</script>

<style>
.marker-display-container {
  margin-left: 1rem;
  height: inherit;
}
.delete-button {
  margin-left: 3rem;
}
</style>
<template>
  <div class="marker-display-container">
    <div v-if="markers.length">
      <a-list
        ><a-list-header
          ><a-typography-title :level="2"
            >Searched</a-typography-title
          ></a-list-header
        ><a-list-item
          v-for="marker in displayedMarkers()"
          :key="generateMakerKey(marker)"
          ><a-row align="middle" gutter="16"
            ><a-col
              ><a-input
                size="large"
                type="checkbox"
                @click="selectMarker(marker)" /></a-col
            ><a-col>
              <MarkerItem
                :marker="marker"
                :onClickMarkerItem="onClickMarkerItem"
              ></MarkerItem></a-col></a-row></a-list-item
      ></a-list>
    </div>
    <a-row justify="space-between" align="middle">
      <a-button
        v-if="markers.length"
        class="delete-button"
        :disabled="!selectedMarkers.length"
        type="default"
        danger
        @click="handleDelete"
      >
        Delete</a-button
      >
      <a-col :span="12" align="middle"
        ><a-pagination
          v-if="markers.length"
          :total="markers.length"
          :defaultCurrent="1"
          :pageSize="5"
          @change="handlePageChange"
      /></a-col>
    </a-row>
  </div>
</template>
