<script>
/* eslint-disable no-undef */
import { Loader } from '@googlemaps/js-api-loader';
import { onMounted, ref, watch } from 'vue';
import getGeolocation from '../utils/getGeoLocation.js';
import markerIsEqual from '../utils/markerIsEqual.js';
import MarkerDisplay from './MarkerDisplay.vue';
import mapTheme from '../utils/mapTheme.js';
const apiKey = process.env.VUE_APP_GOOGLE_MAP_API_KEY;

export default {
  name: 'MapComponent',
  components: { MarkerDisplay },
  props: {
    isDarkTheme: Boolean,
  },
  setup() {
    // refs
    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places', 'marker'],
    });
    const mapDiv = ref(null);
    const map = ref(null);
    const markers = ref([]);

    // Keep track of markers, because markers array is warped with proxy, can't setMap(null) to remove
    let googleMarkers = [];

    const getGeoLocationLoading = ref(false);
    const value = ref('');
    const options = ref([]);
    const autocompleteService = ref(null);
    const placeService = ref(null);
    const placeQuerySucess = ref(null);

    onMounted(async () => {
      await loader.load();
      const { Map } = await google.maps.importLibrary('maps');

      map.value = new Map(mapDiv.value, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });

      autocompleteService.value = new google.maps.places.AutocompleteService();

      placeService.value = new google.maps.places.PlacesService(map.value);

      placeQuerySucess.value = google.maps.places.PlacesServiceStatus.OK;
    });

    const onSearch = (searchText) => {
      autocompleteService.value.getPlacePredictions(
        { input: searchText },
        (predictions, status) => {
          if (status != placeQuerySucess.value || !predictions) {
            alert(status);
            return;
          }

          options.value = predictions.map((prediction) => {
            return {
              value: prediction.place_id,
              label: prediction.description,
            };
          });
        }
      );
    };

    const onSelect = (placeId) => {
      placeService.value.getDetails({ placeId: placeId }, (place, status) => {
        if (status != placeQuerySucess.value || !place) {
          alert(status);
          return;
        }

        const coords = place.geometry.location;
        newMarker(place.name, coords);
        map.value.setCenter(coords);
      });
      value.value = '';
      options.value = [];
    };

    const onClickMarkerItem = (marker) => {
      map.value.setCenter(marker.getPosition());
    };
    const markerExists = (coords) => {
      return markers.value.some((marker) => {
        return (
          marker.getPosition().lat().toFixed(3) === coords.lat().toFixed(3) &&
          marker.getPosition().lng().toFixed(3) === coords.lng().toFixed(3)
        );
      });
    };

    const newMarker = (description, coords) => {
      const newMarker = new google.maps.Marker({
        position: coords,
        map: map.value,
        description: description,
      });

      if (!markerExists(coords)) {
        markers.value.push(newMarker);
        googleMarkers.push(newMarker);
      }
    };

    const getSelfGeolocation = () => {
      getGeoLocationLoading.value = true;
      getGeolocation().then((result) => {
        let coords = result.coords;

        newMarker('My Location', coords);
        map.value.setCenter(coords);
        getGeoLocationLoading.value = false;
      });
    };

    const deleteMarkers = (toBeDeletedMarkers) => {
      toBeDeletedMarkers.forEach((marker) => {
        // Remove the marker from the map
        console.log(marker.getPosition());
        const googleIndex = googleMarkers.findIndex((m) => {
          return markerIsEqual(m, marker);
        });
        if (googleIndex !== -1) {
          googleMarkers[googleIndex].setMap(null);
        } else {
          console.log('not found');
          alert('not found');
        }

        markers.value = markers.value.filter((m) => m !== marker);
        googleMarkers = googleMarkers.filter((m) => m !== marker);
      });
    };
    // watch change in isDarkTheme
    watch(
      () => this.isDarkTheme,
      (newValue) => {
        if (newValue) {
          map.value.setOptions({ styles: darkTheme });
        } else {
          map.value.setOptions({ styles: defaultTheme });
        }
      }
    );
    return {
      markers,
      value,
      onSearch,
      onSelect,
      options,
      mapDiv,
      getSelfGeolocation,
      getGeoLocationLoading,
      onClickMarkerItem,
      deleteMarkers,
    };
  },
};
</script>

<style>
.map-container {
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.2);
}
.max-width {
  width: 100%;
}
.marker-container {
  border-radius: 1rem;
  margin-left: 2rem;
}
</style>

<template>
  <a-row :gutter="16" align="middle">
    <a-auto-complete
      v-model:value="value"
      :options="options"
      style="width: 200px"
      placeholder="input here"
      @select="onSelect"
      @search="onSearch"
    />
    <a-col
      ><a-button
        type="primary"
        @click="getSelfGeolocation"
        :loading="getGeoLocationLoading"
        >Get Current Location</a-button
      ></a-col
    >
  </a-row>
  <a-divider></a-divider>
  <a-row class="max-width" justify="center">
    <a-col :span="14"><div ref="mapDiv" class="map-container"></div></a-col>
    <a-col class="marker-container" :span="8"
      ><MarkerDisplay
        :markers="markers"
        :onClickMarkerItem="onClickMarkerItem"
        :onDelete="deleteMarkers"
      ></MarkerDisplay>
    </a-col>
  </a-row>
</template>
