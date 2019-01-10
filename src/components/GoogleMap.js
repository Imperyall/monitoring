import React from "react";
import { getRandomString } from '../utils';
import InfoWindowExtend from './InfoWindowExtend';
import { withGoogleMap, GoogleMap, Polyline, Marker, TrafficLayer } from "react-google-maps";

const decodeLevels = encodedLevelsString => {
    const decodedLevels = [];
    for (let i = 0; i < encodedLevelsString.length; ++i) {
        const level = encodedLevelsString.charCodeAt(i) - 63;
        decodedLevels.push(level);
    }
    return decodedLevels;
};

const carFile = require('../resources/car.png'); //https://thenounproject.com/search/?q=car

// const isActiveWaypoint = (w, i) => Array.isArray(w) && w.indexOf(i) !== -1;

const arrowSymbol = {
  path: 'M0,-1 L0,1 L3,0 z',
  rotation: -90,
};

const renderRoutePolylines = route => route.index ? route.index.map(waypoint => renderPolyline(waypoint, route.color)) : [ renderPolyline(route, route.color) ];

const renderCarsReal = props => {
  const { cars, startRefresh, stopRefresh, realTime } = props;
  const result = cars.data.filter(item => +item.lat != 0 && +item.lng != 0);

  if (realTime) startRefresh(cars.option); else stopRefresh();

  if (result.length) {
    return result.map(car => (
      <Marker
        key={`car${car.id}`}
        position={{ lat: +car.lat, lng: +car.lng }}
        icon={{ url: carFile }} />
    ));
  }

  return [];
};

const renderPolyline = (waypoint, color) => (
  <Polyline
    key={`p${waypoint.num}${getRandomString()}`}
    options={{
      strokeOpacity: 0.8,
      strokeWeight: 3,
      icons: [{
        icon: arrowSymbol,
        repeat: '100px',
        offset: '100%',
      }],
      zIndex: 'title' in waypoint ? 300 : 200,
      strokeColor: 'title' in waypoint ? color : '#da1050', // '#005cad' : '#da1050',
      levels: decodeLevels('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB')
    }}
    path={
      waypoint.geometry
        .split(',')
        .map(item => window.google.maps.geometry.encoding.decodePath(item))
        .reduce((prev, next) => [...prev, ...next])
    }
  />
);

export default withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={11}
    center={props.center} >
    {
      [ 
        props.showRoutes 
        ? props.routes.reduce((acc, cur) => ([
            ...acc,
            cur.index.map((waypoint, index) => (
              <InfoWindowExtend 
                key={`inf${waypoint.num}`} 
                clearSelect={props.clearSelect} 
                selectPoint={props.selectPoint} 
                changeCenter={props.changeCenter} 
                data={waypoint} 
                index={index} />
              )),
            ...renderRoutePolylines(cur)
          ]), []) 
        : null,

        props.showReal 
        ? props.real.reduce((acc, cur) => ([ ...acc, ...renderRoutePolylines(cur) ]), []) 
        : null,

        ...renderCarsReal(props)
      ]
    }
    { props.traffic && <TrafficLayer autoUpdate /> }
  </GoogleMap>
));