import React from "react";
import { getRandomString } from '../utils';
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

// const isActiveWaypoint = (w, i) => {
//   return Array.isArray(w) && w.indexOf(i) !== -1;
// };

const arrowSymbol = {
  path: 'M0,-1 L0,1 L3,0 z',
  rotation: -90,
};

const renderRoutePolylines = route => route.index ? route.index.map(renderPolyline) : [ renderPolyline(route) ];

const renderCarsReal = props => {
  const { cars, startRefresh, stopRefresh, realTime } = props;
  const result = cars.data.filter(item => +item.lat != 0 && +item.lng != 0);

  if (realTime) startRefresh(cars.option); else stopRefresh();

  if (result.length) {
    return result.map(car => (
      <Marker
        key={`car${car.id}`}
        position={{ lat: +car.lat, lng: +car.lng }}
        icon={{
          url: carFile,
        }}
      />
    ));
  }

  return [];
};

const renderPolyline = waypoint => (
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
      strokeColor: waypoint.title ? '#005cad' : '#da1050',
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
    defaultCenter={props.center} >
    {
      [ 
        props.showRoutes ? props.routes.reduce((acc, cur) => ([
            ...acc,
            cur.index.map((waypoint, index) => {
              const color = '#f00';
              return (
                <Marker
                  key={`m${waypoint.num}`}
                  position={{ lat: +waypoint.lat, lng: +waypoint.lng }}
                  icon={`https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=${index + 1}|${color.slice(1)}|000000`}
                />
              );
            }),
            ...renderRoutePolylines(cur)
          ]), []) : null,

        props.showReal ? props.real.reduce((acc, cur) => ([ ...acc, ...renderRoutePolylines(cur) ]), []) : null,
        ...renderCarsReal(props)
      ]
    }
    { props.traffic && <TrafficLayer autoUpdate /> }
  </GoogleMap>
));