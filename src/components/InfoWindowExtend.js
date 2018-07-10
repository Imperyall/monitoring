import React from 'react';
import PropTypes from 'prop-types';
import { Marker, InfoWindow } from "react-google-maps";
import moment from 'moment';
import { markerColor } from '../utils';

const dateFormat = time => moment(time).isValid() ? moment(time).format("YYYY-MM-DD HH:mm") : false;

class InfoWindowExtend extends React.Component {
  constructor() {
    super();

    this.handleOpen =  this.handleOpen.bind(this);

    this.state = { open: false };
  }

  componentDidUpdate(prevProps) {
    const { selectPoint, data } = this.props;

    if (prevProps.selectPoint !== selectPoint) this.handleOpen(selectPoint == data.doc);
  }

  handleOpen(state) {
    this.setState({ open: state });
  }

  render () {
    const { data, index } = this.props;
    const color = this.state.open ? 'select' : data.status;

    return (
      <Marker
        position={{ lat: +data.lat, lng: +data.lng }}
        onClick={() => this.props.changeCenter(data)}
        icon={`https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=${index + 1}|${markerColor(color).slice(1)}|000000`}>
        { this.state.open && <InfoWindow onCloseClick={() => this.props.changeCenter(data)}>
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
  selectPoint:  PropTypes.string,
  data:         PropTypes.object,
  index:        PropTypes.number,
  changeCenter: PropTypes.func,
};

export default InfoWindowExtend;