import React from 'react';
import PropTypes from 'prop-types';
import { Marker, InfoWindow } from "react-google-maps";
import moment from 'moment';

const dateFormat = time => moment(time).isValid() ? moment(time).format("YYYY-MM-DD HH:mm") : false;

const markerColor = status => {
  switch (status) {
    case 'Отгружен': return '#1dd231';
    case 'Возврат': return '#d81a1a';
    case 'Отказ': return '#dea610';
    case 'Акт': return '#109ede';
    default: return '#ff0';
  }
};

class InfoWindowExtend extends React.Component {
  constructor() {
    super();

    this.handleOpen = this.handleOpen.bind(this);

    this.state = { open: false };
  }

  handleOpen() {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  render () {
    const { data, index } = this.props;

    return (
      <Marker
        position={{ lat: +data.lat, lng: +data.lng }}
        onClick={this.handleOpen}
        icon={`https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=${index + 1}|${markerColor(data.status).slice(1)}|000000`}>
        { this.state.open && <InfoWindow>
          <div style={{ lineHeight: '20px' }}>
            <h4>{data.title}</h4>
            <div>
              <div><span>Документ: <b>{data.doc}</b></span></div>
              <div><span>Статус: <b>{data.status}</b></span></div>
              <div><span>Запланированное время доставки:</span></div>
              <div><span><b>{dateFormat(data.planned_time_s)}</b> - <b>{dateFormat(data.planned_time_e)}</b></span></div>
              <div><span>Фактическое время доставки:</span></div>
              <div><span><b>{dateFormat(data.delivered_time_s)}</b> - <b>{dateFormat(data.delivered_time_e)}</b></span></div>
            </div>
          </div>
        </InfoWindow> }
      </Marker>
    );
  }
}

InfoWindowExtend.propTypes = {
  data:   PropTypes.object,
  index:  PropTypes.number,
};

export default InfoWindowExtend;