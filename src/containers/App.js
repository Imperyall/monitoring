import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GoogleMap from '../components/GoogleMap';
import * as actionsMap from '../actions';
import { Button, Dropdown, Input, Checkbox, Form } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { resizeEvent } from '../utils';
import moment from 'moment';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import NotifyWindowExtend from '../components/NotifyWindowExtend';
import TableExtend from '../components/TableExtend';
import { FULLDATETIME } from '../constants/actionTypes';

const { LatLngBounds } = window.google.maps;

window.notify = NotificationManager;

class App extends React.Component {
  constructor() {
    super();

    this.handleFromDateChange =         this.handleFromDateChange.bind(this);
    this.handleToDateChange =           this.handleToDateChange.bind(this);
    this.handleDepsChange =             this.handleDepsChange.bind(this);
    this.handleDriversChange =          this.handleDriversChange.bind(this);
    this.handleCarsChange =             this.handleCarsChange.bind(this);
    this.handleRoutesChange =           this.handleRoutesChange.bind(this);
    this.handleCheckBoxRealChange =     this.handleCheckBoxRealChange.bind(this);
    this.handleCheckBoxPlanChange =     this.handleCheckBoxPlanChange.bind(this);
    this.handleCheckBoxTrafficChange =  this.handleCheckBoxTrafficChange.bind(this);
    this.handleCheckBoxCarsChange =     this.handleCheckBoxCarsChange.bind(this);
    this.handleCheckBoxDriversChange =  this.handleCheckBoxDriversChange.bind(this);
    this.startRefreshCars =             this.startRefreshCars.bind(this);
    this.stopRefreshCars =              this.stopRefreshCars.bind(this);
    this.handleMapLoad =                this.handleMapLoad.bind(this);
    this.submit =                       this.submit.bind(this);
    this.refreshRoutes =                this.refreshRoutes.bind(this);

    this.state = {
      deps: [],
      cars: [],
      allCars: false,
      routes: [],
      drivers: [],
      allDrivers: false,
      showReal: false,
      showPlan: true,
      showTraffic: false,
      carsReal: []
    };
  }

  componentDidMount() {
    this.props.init();
    this.props.getDrivers();
  }

  componentDidUpdate(prevProps, prevState) {
    const { bounds } = this.props;
    const { routes, showPlan, cars, drivers } = this.state;

    if ((prevState.routes !== routes && showPlan) || (prevState.showPlan !== showPlan && showPlan)) this.props.refreshBounds(routes);

    if ((prevState.cars !== cars) || (prevState.drivers !== drivers)) {
      if (cars.length == 0 && drivers.length == 0) {
        this.getRouteReal();
        this.handleRoutesChange();
        this.props.getRoutes();
      } else if (cars.length == 1) {
        this.refreshRoutes({ car: cars, show: routes });
      } else if (drivers.length == 1) {
        this.refreshRoutes({ driver: drivers, show: routes });
      }
    }

    if (bounds && bounds !== prevProps.bounds) {
      const { east, north, south, west } = bounds;
      const boundsObj = new LatLngBounds({ lat: south, lng: west }, { lat: north, lng: east });
      this._map.fitBounds(boundsObj);
    }
  }

  handleMapLoad(map) {
    this._map = map;
    window._m = map;
  }

  refreshRoutes(params) {
    this.props.getRoutes(params); 
    this.state.showReal && this.getRouteReal();
  }

  startRefreshCars(option) {
    let func, data, options;

    switch (option) {
      case 'drivers':
        func = this.props.getDrivers;
        options = this.state.drivers;
        data = { driver: this.state.drivers };
        break;
      case 'cars':
        func = this.props.getCarsPosition;
        options = this.state.cars;
        data = { car: this.state.cars };
        break;
      case 'none':
        return;
    }

    if (!this._refreshCars) this._refreshCars = setInterval(() => {
      if (!this.props.loading) {
        func(options);
        this.refreshRoutes({ ...data, show: this.state.routes });
      }
    }, 10000);
  }

  stopRefreshCars() {
    if (this._refreshCars) {
      clearInterval(this._refreshCars);
      this._refreshCars = false;
    }
  }

  handleDepsChange(value) {
    this.setState(prevState => ({ deps: value,  allCars: value.length ? prevState.allCars : false }));
    this.props.getCars(value);
  }

  handleDriversChange(value) {
    this.setState({ drivers: value });
    if (value.length == 0) {
      this.props.clearDriver();
      this.props.showRealTime && this.props.toggleRealTime();
    }

    // if (value.length == 1) {
    //   this.props.getRoutes({ driver: value, show: this.state.routes }); 
    //   this.state.showReal && this.getRouteReal();
    // } else if (value.length == 0) {
    //   this.getRouteReal(true);
    // } else {
    //   this.props.getRoutes({ driver: [] });
    //   this.handleRoutesChange();
    // }
  }

  handleCarsChange(value) {
    this.setState({ cars: value });
    value.length != 0 && this.props.getCarsPosition(value);

    // if (value.length == 1) {
    //   this.props.getRoutes({ car: value, show: this.state.routes }); 
    //   this.state.showReal && this.getRouteReal();
    // } else if (value.length == 0) {
    //   this.getRouteReal(true);
    // } else {
    //   this.props.getRoutes({ car: [] });
    //   this.handleRoutesChange();
    // }
  }

  handleRoutesChange(value = []) {
    this.props.clearSelect();
    this.setState(prevState => {
      const routes = prevState.length !== 0 
        ? value.filter(item => !prevState.routes.includes(item)) 
        : value;

      const route = this.props.routes.find(item => item.id === routes[0]);
      const date = {
        fromDate: route && route.delivered_time_s 
          ? moment(new Date(route.delivered_time_s)).seconds(0).format(FULLDATETIME) 
          : moment(new Date()).hour(0).minutes(0).seconds(0).format(FULLDATETIME),
        toDate: route && route.delivered_time_e 
          ? moment(new Date(route.delivered_time_e)).seconds(0).format(FULLDATETIME) 
          : moment(new Date()).hour(23).minutes(0).seconds(0).format(FULLDATETIME),
      };

      if (routes.length == 0) {
        this.props.clearDriver();
        this.props.showRealTime && this.props.toggleRealTime();
      }

      this.props.setDate(date);
      return { routes };
    });
  }

  handleCheckBoxRealChange(e, data) {
    data.checked && this.getRouteReal();
    this.setState({ showReal: data.checked });
  }

  handleCheckBoxPlanChange(e, data) {
    this.state.showReal && this.getRouteReal();
    this.setState({ showPlan: data.checked });
  }

  handleCheckBoxCarsChange(e, data) {
    this.setState({ allCars: data.checked, allDrivers: false, drivers: [] });
    // this.handleCarsChange([]);///////////////////////////////////////////////
  }

  handleCheckBoxDriversChange(e, data) {
    this.setState({ allDrivers: data.checked, allCars: false, drivers: [] });
    // this.handleCarsChange([]);///////////////////////////////////////////////
  }

  handleCheckBoxTrafficChange(e, data) {
    this.setState({ showTraffic: data.checked });
  }

  handleFromDateChange(event) {
    this.props.setDate({ fromDate: event.target.value });
  }

  handleToDateChange(event) {
    this.props.setDate({ toDate: event.target.value });
  }

  getRouteReal() {
    this.props.getRouteReal({
      driver: this.state.drivers[0],
      car: this.state.drivers[0] ? undefined : this.state.cars[0], 
      date_from: moment(this.props.fromDate).isValid() ? moment(this.props.fromDate).format(FULLDATETIME) : null, 
      date_to: moment(this.props.toDate).isValid() ? moment(this.props.toDate).format(FULLDATETIME) : null
    });
  }

  submit() {
    if (this.state.showReal) this.getRouteReal(); else
    if (this.state.showPlan) this.props.refreshBounds(this.state.routes);
  }

  render() {
    const mapStyle = { height: `100%` };
    const deliveryDepsOptions = this.props.deliveryDeps.map(option => ({
      text: option.title, value: option.id
    }));

    const driverOptions = this.props.drivers.map(option => ({
      text: option.name, value: option.id//'10742'
    }));

    const carsOptions = this.props.cars.map(option => ({
      text: `${option.brand} - ${option.number}`, value: option.id
    }));

    const routeOptions = this.props.routes.map(option => ({
      text: `${option.id1} - ${option.delivery_date}`,
      value: option.id,
      label: { color: option.color, empty: true, circular: true }
    }));

    const showCheckbox = this.state.cars.length != 1 && this.state.drivers.length != 1;

    //const showRoutes = this.state.routes.length;//this.state.drivers.length || this.state.routes.length;
    const showDrivers = this.state.cars.length !== 0 || this.state.allCars;
    const showCars = this.state.drivers.length !== 0 || this.state.allDrivers;

    const carsPos = this.state.allCars ? this.props.cars : this.props.cars.filter(car => this.state.cars.indexOf(car.id) !== -1);
    const driversPos = this.state.allDrivers 
      ? this.props.drivers 
      : this.props.driver.length == 1 
        ? this.props.driver
        : this.props.drivers.filter(driver => this.state.drivers.indexOf(driver.id) !== -1);

    const visibleData = driversPos.length 
      ? { data: driversPos, option: 'drivers' } 
      : ( carsPos.length ? { data: carsPos, option: 'cars' } : { data: driversPos, option: 'none' } );

    return (
      <div id="monitoring_container">
        <div id="top_side">
          <div id="map_side">
            <GoogleMap
              containerElement={<div style={mapStyle} />}
              mapElement={<div style={mapStyle} />} 
              cars={visibleData}
              realTime={this.props.showRealTime}
              startRefresh={this.startRefreshCars}
              stopRefresh={this.stopRefreshCars}
              onMapLoad={this.handleMapLoad}
              center={this.props.center}
              selectPoint={this.props.selectPoint}
              changeCenter={this.props.changeCenter}
              clearSelect={this.props.clearSelect}
              routes={this.props.routes.filter(item => this.state.routes.indexOf(item.id) !== -1)}
              showRoutes={this.state.showPlan && this.state.routes.length}
              real={this.props.real}
              traffic={this.state.showTraffic}
              showReal={this.state.showReal} />
          </div>
          <div id="divider_side" onMouseDown={() => resizeEvent()} />
          <div id="filter_side">
            <Form>
              <Form.Field>
                <Dropdown 
                  closeOnChange={true} 
                  multiple 
                  search 
                  selection 
                  fluid
                  noResultsMessage="Отсутствуют элементы" 
                  placeholder="Отделы доставки"
                  options={deliveryDepsOptions}
                  value={this.state.deps}
                  onChange={(e, data) => this.handleDepsChange(data.value)} />
              </Form.Field>
              <Form.Field className="combo-field">
                <Dropdown 
                  closeOnChange={true} 
                  multiple 
                  search 
                  selection 
                  fluid
                  noResultsMessage="Отсутствуют элементы" 
                  placeholder="Водители"
                  disabled={showDrivers || this.state.allDrivers}
                  options={driverOptions}
                  value={this.state.drivers}
                  onChange={(e, data) => this.handleDriversChange(data.value)} />
                <Checkbox 
                  label="Все" 
                  disabled={showDrivers}
                  checked={this.state.allDrivers}
                  onChange={this.handleCheckBoxDriversChange} />
              </Form.Field>
              <Form.Field className="combo-field">
                <Dropdown 
                  closeOnChange={true} 
                  multiple 
                  search 
                  selection 
                  fluid
                  noResultsMessage="Отсутствуют элементы" 
                  placeholder="ТС"
                  disabled={showCars || this.state.allCars}
                  options={carsOptions}
                  value={this.state.cars}
                  onChange={(e, data) => this.handleCarsChange(data.value)} />
                <Checkbox 
                  label="Все" 
                  disabled={showCars}
                  checked={this.state.allCars}
                  onChange={this.handleCheckBoxCarsChange} />
              </Form.Field>
              <Form.Field>
                <Dropdown 
                  closeOnChange={true} 
                  multiple 
                  search 
                  selection 
                  fluid
                  noResultsMessage="Отсутствуют элементы" 
                  placeholder="Маршруты"
                  options={routeOptions} 
                  value={this.state.routes}
                  renderLabel={label => ({ color: label.label.color, content: `${label.text}` })}
                  onChange={(e, data) => this.handleRoutesChange(data.value)} />
              </Form.Field>
              <div className="time-box">
                <b>начало</b>
                <Input 
                  size="mini" 
                  type="datetime-local"
                  value={this.props.fromDate}
                  onChange={this.handleFromDateChange} />
              </div>
              <div className="time-box">
                <b>конец</b>
                <Input 
                  size="mini" 
                  type="datetime-local"
                  value={this.props.toDate}
                  onChange={this.handleToDateChange} />
              </div>
              <div>
                <Checkbox 
                  label="ТС в реальном времени" 
                  disabled={showCheckbox}
                  checked={this.props.showRealTime}
                  onChange={this.props.toggleRealTime} />
              </div>
              <div className="real-route">
                <Checkbox 
                  label="Реальный маршрут" 
                  disabled={showCheckbox}
                  checked={this.props.showReal}
                  onChange={this.handleCheckBoxRealChange} />
              </div>
              <div>
                <Checkbox 
                  disabled={showCheckbox}
                  checked={this.state.showPlan}
                  onChange={this.handleCheckBoxPlanChange}
                  label="Запланированный маршрут" />
              </div>
              <div>
                <Checkbox 
                  checked={this.state.showTraffic}
                  onChange={this.handleCheckBoxTrafficChange}
                  label="Пробки" />
              </div>
              <Button 
                style={{ marginTop: '20px' }} 
                primary 
                fluid
                loading={this.props.loading}
                disabled={this.props.loading}
                onClick={() => this.submit()}>Применить</Button>
            </Form>
          </div>
          <NotificationContainer/>
          <NotifyWindowExtend/>
        </div>
        <div id="bottom_side">
          <TableExtend
            routes={this.props.routes.filter(item => this.state.routes.includes(item.id))}
            real={{ distance: this.props.distance, duration: this.props.duration }}
            selectRoute={this.props.refreshBounds}
            selectWaypoint={this.props.changeCenter} />
        </div>
      </div>
    );
  }
}

App.propTypes = {
  deliveryDeps:    PropTypes.array,
  cars:            PropTypes.array,
  drivers:         PropTypes.array,
  driver:          PropTypes.array,
  routes:          PropTypes.array,
  real:            PropTypes.array,
  loading:         PropTypes.bool,
  showReal:        PropTypes.bool,
  showRealTime:    PropTypes.bool,
  center:          PropTypes.object,
  bounds:          PropTypes.object,
  selectPoint:     PropTypes.string,
  getRouteReal:    PropTypes.func,
  getCars:         PropTypes.func,
  getCarsPosition: PropTypes.func,
  getDrivers:      PropTypes.func,
  getRoutes:       PropTypes.func,
  init:            PropTypes.func,
  startLoading:    PropTypes.func,
  refreshBounds:   PropTypes.func,
  changeCenter:    PropTypes.func,
  clearSelect:     PropTypes.func,
  clearDriver:     PropTypes.func,
  toggleRealTime:  PropTypes.func,
  setDate:         PropTypes.func,
  distance:        PropTypes.number,
  duration:        PropTypes.number,
  fromDate:        PropTypes.string,
  toDate:          PropTypes.string,
};

const mapStateToProps = state => ({
  deliveryDeps:    state.deliveryDeps,
  cars:            state.cars,
  drivers:         state.drivers,
  driver:          state.driver,
  routes:          state.routes,
  real:            state.real,
  loading:         state.loading.length !== 0,
  center:          state.center,
  bounds:          state.bounds,
  selectPoint:     state.selectPoint,
  showRealTime:    state.showRealTime,
  distance:        state.distance,
  duration:        state.duration,
  fromDate:        state.fromDate,
  toDate:          state.toDate,
});

const mapDispatchToProps = actionsMap;

export default connect(mapStateToProps, mapDispatchToProps)(App);