import axios from 'axios';
import core_url from '../constants/baseUrl';
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
  CLEAR_DRIVER,
} from '../constants/actionTypes';
import { getRandomString } from '../utils';

const logging = (fun, response) => {
  //process.env.NODE_ENV === 'development' && 
  console.log(`[RESPONSE][${fun}]`, response.data && response.data.length ? response.data : 'null');

  if (response.data && response.data.hasOwnProperty('code')) notify(response.data.code, response.data.text);
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

  return axios.get(`${core_url}/mon/cars/`, { params: { delivery_dep } })
    .then(res => {
      logging('getCars', res);

      dispatch({ type: GET_CARS, payload: Array.isArray(res.data) ? res.data : [] });
    }).catch(res => {
      logging('getCars error', res);
    }).finally(() => dispatch(startLoading({ end: eventId })));
};

export const getCarsPosition = car => dispatch => {
  const eventId = getRandomString();
  dispatch(startLoading({ add: eventId }));

  return axios.get(`${core_url}/mon/cars/latlng/`, { params: { car } })
    .then(res => {
      logging('getCarsPosition', res);

      dispatch({ type: GET_CARS_POSITION, payload: Array.isArray(res.data) ? res.data : [] });
    }).catch(res => {
      logging('getCarsPosition error', res);
    }).finally(() => dispatch(startLoading({ end: eventId })));
};

export const getDrivers = pk => dispatch => {
  const eventId = getRandomString();
  dispatch(startLoading({ add: eventId }));

  return axios.get(`${core_url}/driver/`, { params: { pk } })
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

  return axios.get(`${core_url}/mon/routes/`, { params: { car, driver } })
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

      dispatch({ type: GET_ROUTE_REAL, payload: { car, driver, data: 'geometry' in res.data ? res.data : [] } });
    }).catch(res => {
      logging('getRouteReal error', res);
    }).finally(() => dispatch(startLoading({ end: eventId })));
};

export const startLoading = action => dispatch => (dispatch({ type: START_LOADING, payload: action }));
export const refreshBounds = action => dispatch => (dispatch({ type: REFRESH_BOUNDS, payload: action }));
export const changeCenter = action => dispatch =>  (dispatch({ type: CHANGE_CENTER,  payload: action }));
export const setDate = action => dispatch =>  (dispatch({ type: SET_DATE,  payload: action }));
export const toggleRealTime = () => dispatch => (dispatch({ type: SHOW_REAL_TIME }));
export const clearSelect = () => dispatch => (dispatch({ type: CLEAR_SELECT }));
export const clearDriver = () => dispatch => (dispatch({ type: CLEAR_DRIVER }));


