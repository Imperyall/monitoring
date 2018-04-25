import {
  INIT_STATE,
  GET_CARS,
  GET_DRIVERS,
  GET_ROUTES,
  GET_ROUTE_REAL,
  START_LOADING,
  REFRESH_BOUNDS,
} from '../constants/actionTypes';

const DEFAULT_STATE = {
  deliveryDeps: [],
  cars: [],
  drivers: [],
  routes: [],
  real: [],
  bounds: null,
  loading: false,
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

const getRandomString = () => Math.random().toString(36).substring(7);

export default function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case INIT_STATE: {
      return {
        ...state,
        deliveryDeps: action.payload,
        loading: false,
      };
    }

    case START_LOADING: {
      return {
        ...state,
        loading: action.payload === undefined ? true : action.payload,
      };
    }

    case GET_CARS: {
      return {
        ...state,
        cars: action.payload,
        loading: false,
      };
    }

    case GET_DRIVERS: {
      return {
        ...state,
        drivers: action.payload,
        loading: false,
      };
    }

    case GET_ROUTES: {
      return {
        ...state,
        routes: action.payload.routes,
        bounds: action.payload.show.length
          ? { ...getRouteBounds(action.payload.routes).toJSON(), hash: getRandomString() }
          : null,
        loading: false,
      };
    }

    case REFRESH_BOUNDS: {
      if (!action.payload.length) return state;

      return {
        ...state,
        bounds: action.payload.length
          ? { ...getRouteBounds(state.routes.find(item => action.payload.indexOf(item.id) !== -1 ).index).toJSON(), hash: getRandomString() }
          : null,
        loading: false,
      };
    }

    case GET_ROUTE_REAL: {
      if (!action.payload.car) return state; 

      let newState = state, index = newState.real.findIndex(item => item.geometry == action.payload.data),
          data = action.payload.data.map((item, index) => ({ num: index, geometry: item }));

      if (index !== -1) newState.real.splice(index, 1);

      return {
        ...newState,
        loading: false,
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