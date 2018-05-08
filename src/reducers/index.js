import {
  INIT_STATE,
  GET_CARS,
  GET_DRIVERS,
  GET_ROUTES,
  GET_ROUTE_REAL,
  START_LOADING,
  REFRESH_BOUNDS,
} from '../constants/actionTypes';
import { getRandomString, getRouteColor } from '../utils';

const DEFAULT_STATE = {
  deliveryDeps: [],
  cars: [],
  drivers: [],
  routes: [],
  real: [],
  bounds: null,
  loading: [],
  center: { lat: 45.0444582, lng: 39.0145869 },
};

const getRouteBounds = route => {
  const bounds = new window.google.maps.LatLngBounds();

  if (route.length) {
    const points = route.map(waypoint => (
      waypoint.geometry 
      ? waypoint.geometry.split(',').map(item => window.google.maps.geometry.encoding.decodePath(item)).reduce((prev, next) => [...prev, ...next])
      : [new window.google.maps.LatLng(waypoint.lat, waypoint.lng)]
    )).reduce((prev, next) => [...prev, ...next]);

    points.forEach(point => bounds.extend(point));
  }

  return bounds;
};

export default function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case INIT_STATE: {
      return {
        ...state,
        deliveryDeps: action.payload,
      };
    }

    case START_LOADING: {
      const { add, end } = action.payload;
      let newLoading = state.loading;

      if (end) {
        newLoading.splice(state.loading.indexOf(end), 1);
      } else if (add) {
        newLoading.push(add);
      }

      return {
        ...state,
        loading: newLoading,
      };
    }

    case GET_CARS: {
      return {
        ...state,
        cars: action.payload,
      };
    }

    case GET_DRIVERS: {
      return {
        ...state,
        drivers: action.payload,
      };
    }

    case GET_ROUTES: {
      return {
        ...state,
        routes: action.payload.routes.map((route, index) => ({ ...route, color: getRouteColor(index) })),
        bounds: action.payload.show && action.payload.show.length
          ? { ...getRouteBounds(action.payload.routes).toJSON(), hash: getRandomString() }
          : null,
      };
    }

    case REFRESH_BOUNDS: {
      if (!action.payload.length) return state;

      return {
        ...state,
        bounds: action.payload.length
          ? { ...getRouteBounds(state.routes.find(item => action.payload.indexOf(item.id) !== -1 ).index).toJSON(), hash: getRandomString() }
          : null,
      };
    }

    case GET_ROUTE_REAL: {
      if (!action.payload.car && !action.payload.driver) return { ...state, real: [] }; 

      let newState = state, index = newState.real.findIndex(item => item.geometry == action.payload.data),
          data = action.payload.data.map((item, index) => ({ num: index, geometry: item }));

      if (index !== -1) newState.real.splice(index, 1);

      return {
        ...newState,
        bounds: data.length 
          ? { ...getRouteBounds(data).toJSON(), hash: getRandomString() }
          : null,
        real: data
      };
    }

    default: {
      return state;
    }
  }
}