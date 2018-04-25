import axios from 'axios';
import 'babel-polyfill';
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

export const init = () => dispatch => {
  // let url = await core_url();
  // console.log('1212', url.data);

  return axios.get(`${core_url}/deliverydeps/get/`)
    .then(res => dispatch({ type: INIT_STATE, payload: Array.isArray(res.data) ? res.data : [] }))
    .catch(res => {
      console.log(res);
      dispatch(startLoading(false));
    });
};

export const getCars = delivery_dep => dispatch => {
  dispatch(startLoading());

  if (!delivery_dep.length) return dispatch({ type: GET_CARS, payload: []});

  return axios.get(`${core_url}/mon/cars/`, { params: { format: 'json', delivery_dep } })
    .then(res => dispatch({ type: GET_CARS, payload: Array.isArray(res.data) ? res.data : [] }))
    .catch(res => {
      console.log(res);
      dispatch(startLoading(false));
    });
};

export const getDrivers = () => dispatch => {
  dispatch(startLoading());

  return axios.get(`${core_url}/driver/`, { params: { format: 'json' } })
    .then(res => dispatch({ type: GET_DRIVERS, payload: Array.isArray(res.data) ? res.data : [] }))
    .catch(res => {
      console.log(res);
      dispatch(startLoading(false));
    });
};

export const getRoutes = (car, show) => dispatch => {
  dispatch(startLoading());
  
  if (!car.length) return dispatch({ type: GET_ROUTES, payload: { routes: [], show: [] } });

  return axios.get(`${core_url}/mon/routes/`, { params: { format: 'json', car } })
    .then(res => dispatch({ type: GET_ROUTES, payload: { routes: Array.isArray(res.data) ? res.data : [], show: Array.isArray(res.data) ? show : [] } }))
    .catch(res => {
      console.log(res);
      dispatch(startLoading(false));
    });
};

export const getRouteReal = ({car, date_from, date_to}) => dispatch => {
  dispatch(startLoading());
  
  if (!car) return dispatch({ type: GET_ROUTE_REAL, payload: { car, data: [] }});

  return axios.get(`${core_url}/mon/car/points/`, { params: { car, date_from, date_to } })
    .then(res => dispatch({ type: GET_ROUTE_REAL, payload: { car, data: res.data.hasOwnProperty('geometry') ? res.data.geometry : [] }}))
    .catch(res => {
      console.log(res);
      dispatch(startLoading(false));
    });
};

export const startLoading = action => dispatch => (dispatch({ type: START_LOADING, payload: action }));
export const refreshBounds = action => dispatch => (dispatch({ type: REFRESH_BOUNDS, payload: action }));


