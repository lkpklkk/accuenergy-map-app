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
  props: {
    isDarkTheme: Boolean,
  },
  components: { MarkerDisplay },
  setup(props) {
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

    const focusSearch = ref(null);

    onMounted(async () => {
      await loader.load();
      const { Map } = await google.maps.importLibrary('maps');

      map.value = new Map(mapDiv.value, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
        styles: mapTheme.light,
      });

      autocompleteService.value = new google.maps.places.AutocompleteService();

      placeService.value = new google.maps.places.PlacesService(map.value);

      placeQuerySucess.value = google.maps.places.PlacesServiceStatus.OK;

      // Attach a global event listener to the window
      window.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          focusSearch.value.focus();
        }
      });
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
        newMarker(place.name, coords.lat(), coords.lng());
        map.value.setCenter(coords);
      });
      value.value = '';
      options.value = [];
    };

    const onClickMarkerItem = (marker) => {
      map.value.setCenter(marker.getPosition());
    };
    const markerExists = (lat, lng) => {
      return markers.value.some((marker) => {
        return (
          marker.getPosition().lat().toFixed(3) === lat.toFixed(3) &&
          marker.getPosition().lng().toFixed(3) === lng.toFixed(3)
        );
      });
    };

    const newMarker = (description, lat, lng) => {
      const newMarker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map.value,
        description: description,
      });

      if (!markerExists(lat, lng)) {
        markers.value.push(newMarker);
        googleMarkers.push(newMarker);
      }
    };

    const getSelfGeolocation = () => {
      getGeoLocationLoading.value = true;
      getGeolocation().then((result) => {
        let coords = result.coords;

        newMarker('My Location', coords.lat, coords.lng);
        map.value.setCenter(coords);
        getGeoLocationLoading.value = false;
      });
    };

    const deleteMarkers = (toBeDeletedMarkers) => {
      toBeDeletedMarkers.forEach((marker) => {
        // Remove the marker from the map

        const googleIndex = googleMarkers.findIndex((m) => {
          return markerIsEqual(m, marker);
        });
        if (googleIndex !== -1) {
          googleMarkers[googleIndex].setMap(null);
        } else {
          alert('not found');
        }

        markers.value = markers.value.filter((m) => m !== marker);
        googleMarkers = googleMarkers.filter((m) => m !== marker);
      });
    };
    // watch change in isDarkTheme
    watch(
      () => props.isDarkTheme,
      (newValue) => {
        if (newValue) {
          map.value.setOptions({ styles: mapTheme.dark });
        } else {
          map.value.setOptions({ styles: mapTheme.light });
        }
      }
    );
    return {
      focusSearch,
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
  methods: {},
};
</script>

<style>
.map-container {
  width: 100%;
  border-radius: 1em;
  box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.2);
  flex: auto;
  height: 40vh;
}
.max-width {
  width: 100%;
}
.marker-container {
  border-radius: 1em;
  margin-left: 2em;
}
.search-bar {
  margin-top: 2em;
  .auto-complete {
    width: 95%;
    margin-right: 1em;
  }
}
@media screen and (max-width: 768px) {
  .search-bar {
    margin-top: 1em;
    .auto-complete {
      width: 95%;
      margin-right: 1em;
    }
  }
  .marker-container {
    border-radius: 1em;
    margin: 0;
    margin-top: 1em;
  }
}
</style>

<template>
  <a-divider></a-divider>
  <a-row class="max-width" justify="start">
    <a-col flex="1 1 384px"
      ><div ref="mapDiv" class="map-container"></div
    ></a-col>
    <a-col flex="0 1 384px"
      ><MarkerDisplay
        class="marker-container"
        :markers="markers"
        :onClickMarkerItem="onClickMarkerItem"
        :onDelete="deleteMarkers"
      ></MarkerDisplay>
    </a-col>
  </a-row>

  <a-row
    class="max-width search-bar"
    :gutter="32"
    align="middle"
    justify="start"
    ><a-col :span="14">
      <a-row class="max-width" justify="space-between" align="middle"
        ><a-col flex="1"
          ><a-auto-complete
            ref="focusSearch"
            :disabled="getGeoLocationLoading"
            size="large"
            class="auto-complete"
            v-model:value="value"
            :options="options"
            placeholder="Search"
            @select="onSelect"
            @search="onSearch"
          />
        </a-col>
        <a-col
          ><a-button
            type="primary"
            @click="getSelfGeolocation"
            :loading="getGeoLocationLoading"
            >Mark My Location</a-button
          ></a-col
        ></a-row
      >
    </a-col>
  </a-row>
</template>
