import React from "react";
import { withGoogleMap, GoogleMap, Polyline, Marker, TrafficLayer } from "react-google-maps";

const decodeLevels = encodedLevelsString => {
    const decodedLevels = [];
    for (let i = 0; i < encodedLevelsString.length; ++i) {
        const level = encodedLevelsString.charCodeAt(i) - 63;
        decodedLevels.push(level);
    }
    return decodedLevels;
};

// const isActiveWaypoint = (w, i) => {
//   return Array.isArray(w) && w.indexOf(i) !== -1;
// };

const arrowSymbol = {
  path: 'M0,-1 L0,1 L3,0 z',
  rotation: -90,
};

const renderRoutePolylines = route => route.index ? route.index.map(renderPolyline) : [ renderPolyline(route) ];

const renderCarsReal = props => {
  const { cars, startRefresh, stopRefresh } = props;
  const result = cars.data.filter(item => +item.lat != 0 && +item.lng != 0);

  if (result.length) {
    startRefresh(cars.option);

    return result.map(car => {
      const pos = { lat: +car.lat, lng: +car.lng };

      return (
        <Marker
          key={`car${car.id}`}
          position={pos}
          icon={{
            url: '../resources/car3.png',
          }}
        />
      );
    });
  } else stopRefresh();

  return [];
};

const renderPolyline = waypoint => (
  <Polyline
    key={`p${waypoint.num}`}
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
              const pos = { lat: +waypoint.lat, lng: +waypoint.lng };
              return (
                <Marker
                  key={`m${waypoint.num}`}
                  position={pos}
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