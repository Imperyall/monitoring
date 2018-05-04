import axios from 'axios';
import core_url from '../constants/baseUrl';
import {
  INIT_STATE,
  GET_CARS,
  GET_DRIVERS,
  GET_ROUTES,
  GET_ROUTE_REAL,
  START_LOADING,
  REFRESH_BOUNDS,
} from '../constants/actionTypes';
import { getRandomString } from '../utils';

const logging = (fun, response) => {
  //process.env.NODE_ENV === 'development' && 
  console.log(`[RESPONSE][${fun}]`, response.data && response.data.length ? response.data : 'null');

  if (response.data.code) notify(response.data.code, response.data.text);
};

const notify = (type, text) => {
  switch (type.toLowerCase()) {
    case 'info':
      window.notify.info(text);
      break;
    case 'success':
      window.notify.success(text);
      break;
    case 'warning':
      window.notify.warning(text, 'Предупреждение');
      break;
    case 'error':
      window.notify.error(text, 'Ошибка');
      break;
  }
};

export const init = () => dispatch => {
  const eventId = getRandomString();
  dispatch(startLoading({ add: eventId }));

  return axios.get(`${core_url}/deliverydeps/get/`)
    .then(res => {
      logging('init', res);

      dispatch({ type: INIT_STATE, payload: Array.isArray(res.data) ? res.data : [] });
    }).catch(res => {
      logging('init error', res);
    }).finally(() => dispatch(startLoading({ end: eventId })));
};

export const getCars = delivery_dep => dispatch => {
  const eventId = getRandomString();
  dispatch(startLoading({ add: eventId }));

  if (!delivery_dep.length) {
    dispatch(startLoading({ end: eventId }));

    return dispatch({ type: GET_CARS, payload: []});
  }

  return axios.get(`${core_url}/mon/cars/`, { params: { format: 'json', delivery_dep } })
    .then(res => {
      logging('getCars', res);

      dispatch({ type: GET_CARS, payload: Array.isArray(res.data) ? res.data : [] });
    }).catch(res => {
      logging('getCars error', res);
    }).finally(() => dispatch(startLoading({ end: eventId })));
};

export const getDrivers = () => dispatch => {
  const eventId = getRandomString();
  dispatch(startLoading({ add: eventId }));

  return axios.get(`${core_url}/driver/`, { params: { format: 'json' } })
    .then(res => {
      logging('getDrivers', res);

      dispatch({ type: GET_DRIVERS, payload: Array.isArray(res.data) ? res.data : [] });
    }).catch(res => {
      logging('getDrivers error', res);
    }).finally(() => dispatch(startLoading({ end: eventId })));
};

export const getRoutes = ({car, driver, show} = {}) => dispatch => {
  const eventId = getRandomString();
  dispatch(startLoading({ add: eventId }));
  
  if (!car && !driver) {
    dispatch(startLoading({ end: eventId }));

    return dispatch({ type: GET_ROUTES, payload: { routes: [] } });
  }

  return axios.get(`${core_url}/mon/routes/`, { params: { format: 'json', car, driver } })
    .then(res => {
      logging('getRoutes', res);

      dispatch({ type: GET_ROUTES, payload: { routes: Array.isArray(res.data) ? res.data : [], show: Array.isArray(res.data) ? show : [] } });
    }).catch(res => {
      logging('getRoutes error', res);
    }).finally(() => dispatch(startLoading({ end: eventId })));
};

export const getRouteReal = ({car, driver, date_from, date_to}) => dispatch => {
  const eventId = getRandomString();
  dispatch(startLoading({ add: eventId }));
  
  if (!car && !driver) {
    dispatch(startLoading({ end: eventId }));

    return dispatch({ type: GET_ROUTE_REAL, payload: {} });
  }

  return axios.get(`${core_url}/mon/points/`, { params: { car, driver, date_from, date_to } })
    .then(res => {
      logging('getRouteReal', res);

      dispatch({ type: GET_ROUTE_REAL, payload: { car, driver, data: res.data.hasOwnProperty('geometry') ? res.data.geometry : [] }});
    }).catch(res => {
      logging('getRouteReal error', res);
    }).finally(() => dispatch(startLoading({ end: eventId })));
};

export const startLoading = action => dispatch => (dispatch({ type: START_LOADING, payload: action }));
export const refreshBounds = action => dispatch => (dispatch({ type: REFRESH_BOUNDS, payload: action }));


