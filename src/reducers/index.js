import {
  INIT_STATE,
  GET_CARS,
  GET_CARS_POSITION,
  GET_DRIVERS,
  GET_ROUTES,
  GET_ROUTE_REAL,
  START_LOADING,
  REFRESH_BOUNDS,
  CHANGE_CENTER,
  CLEAR_SELECT,
  SHOW_REAL_TIME,
  SET_DATE,
  FULLDATETIME,
  CLEAR_DRIVER,
} from '../constants/actionTypes';
import { getRandomString, getRouteColor } from '../utils';
import moment from 'moment';

const DEFAULT_STATE = {
  deliveryDeps: [],
  cars: [],
  drivers: [],
  driver: [],
  routes: [],
  real: [],
  bounds: null,
  loading: [],
  selectPoint: null,
  center: { lat: 45.0444582, lng: 39.0145869 },
  showRealTime: false,
  distance: 0,
  duration: 0,
  fromDate: moment(new Date()).hour(0).minutes(0).seconds(0).format(FULLDATETIME),
  toDate: moment(new Date()).hour(23).minutes(0).seconds(0).format(FULLDATETIME),
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

    case GET_CARS_POSITION: {
      if (action.payload.length == 0 ) return state;

      return {
        ...state,
        cars: state.cars.map(car => ({ ...car, ...action.payload.find(item => item.id == car.id) }))
      };
    }

    case GET_DRIVERS: {
      const param = action.payload.length == 1 ? { driver: action.payload } : { drivers: action.payload };

      return { ...state, ...param };
    }

    case CHANGE_CENTER: {
      const { doc, lat, lng } = action.payload;

      return {
        ...state,
        selectPoint: state.selectPoint == doc.join() ? null : doc.join(),
        center: { lat: +lat, lng: +lng },
      };
    }

    case CLEAR_SELECT: {
      return { ...state, selectPoint: null };
    }

    case CLEAR_DRIVER: {
      return {
        ...state,
        driver: [],
      };
    }

    case GET_ROUTES: {
      return {
        ...state,
        routes: action.payload.routes.map((route, index) => ({ ...route, color: getRouteColor(index) })),
        bounds: !state.showRealTime && action.payload.show && action.payload.show.length
          ? { ...getRouteBounds(action.payload.routes).toJSON(), hash: getRandomString() }
          : null,
      };
    }

    case REFRESH_BOUNDS: {
      if (!action.payload.length) return state;

      return {
        ...state,
        bounds: { 
          ...getRouteBounds(state.routes.find(item => action.payload.indexOf(item.id) !== -1 ).index).toJSON(), 
          hash: getRandomString() 
        }
      };
    }

    case GET_ROUTE_REAL: {
      const { car, driver, data } = action.payload;
      if (!car && !driver) return { ...state, real: [] }; 

      let newState = state, index = newState.real.findIndex(item => item.geometry == data.geometry),
          geometry = data.geometry.map((item, index) => ({ num: index, geometry: item }));

      if (index !== -1) newState.real.splice(index, 1);

      return {
        ...newState,
        bounds: !state.showRealTime && geometry.length 
          ? { ...getRouteBounds(geometry).toJSON(), hash: getRandomString() }
          : null,
        real: geometry,
        distance: data.distance,
        duration: data.duration,
      };
    }

    case SHOW_REAL_TIME: {
      return { 
        ...state, 
        driver: [],
        showRealTime: !state.showRealTime,
      };
    }

    case SET_DATE: {
      return { ...state, ...action.payload  };
    }

    default: {
      return state;
    }
  }
}