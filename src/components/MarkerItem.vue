<template>
  <div class="item-card">
    <a-row>
      <a-typography-title class="clickable" @click="handleClick()" :level="5">{{
        getDescription()
      }}</a-typography-title>
    </a-row>
    <a-row>
      <a-typography-text type="secondary">{{ getCoords() }}</a-typography-text>
    </a-row>
  </div>
</template>
<script>
export default {
  props: {
    marker: Object,
    onClickMarkerItem: Function,
  },
  methods: {
    getDescription() {
      return this.marker.description;
    },
    getCoords() {
      return (
        this.marker.getPosition().lat().toFixed(2) +
        ' , ' +
        this.marker.getPosition().lng().toFixed(2)
      );
    },
    handleClick() {
      this.onClickMarkerItem(this.marker);
    },
  },
};
</script>
<style>
p {
  margin: 0;
}
.clickable {
  cursor: pointer;
}
</style>
