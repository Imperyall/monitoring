import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GoogleMap from '../components/GoogleMap';
import * as actionsMap from '../actions';
import { Button, Header, Dropdown, Input, Checkbox } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { resizeEvent } from '../utils';
import moment from 'moment';

const { LatLngBounds } = window.google.maps;

class App extends React.Component {
  constructor() {
    super();

    this.handleFromDateChange =        this.handleFromDateChange.bind(this);
    this.handleToDateChange =          this.handleToDateChange.bind(this);
    this.handleDepsChange =            this.handleDepsChange.bind(this);
    this.handleDriversChange =         this.handleDriversChange.bind(this);
    this.handleCarsChange =            this.handleCarsChange.bind(this);
    this.handleRoutesChange =          this.handleRoutesChange.bind(this);
    this.handleCheckBoxRealChange =    this.handleCheckBoxRealChange.bind(this);
    this.handleCheckBoxPlanChange =    this.handleCheckBoxPlanChange.bind(this);
    this.handleCheckBoxTrafficChange = this.handleCheckBoxTrafficChange.bind(this);
    this.handleCheckBoxCarsChange =    this.handleCheckBoxCarsChange.bind(this);
    this.handleCheckBoxDriversChange = this.handleCheckBoxDriversChange.bind(this);
    this.startRefreshCars =            this.startRefreshCars.bind(this);
    this.stopRefreshCars =             this.stopRefreshCars.bind(this);
    this.handleMapLoad =               this.handleMapLoad.bind(this);
    this.submit =                      this.submit.bind(this);

    this.state = {
      fromDate: moment(new Date()).hour(0).minutes(0).seconds(0).format("YYYY-MM-DDTHH:mm:ss"),
      toDate: moment(new Date()).hour(23).minutes(0).seconds(0).format("YYYY-MM-DDTHH:mm:ss"),
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
    this.props.startLoading();
    this.props.init();
    this.props.getDrivers();
  }

  componentDidUpdate(prevProps, prevState) {
    if ((prevState.routes !== this.state.routes && this.state.showPlan) || (prevState.showPlan !== this.state.showPlan && this.state.showPlan)) this.props.refreshBounds(this.state.routes);

    const { bounds } = this.props;

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

  startRefreshCars(option) {
    let func;

    switch (option) {
      case 'drivers':
        func = this.props.getDrivers;
        break;
      case 'cars':
        func = this.props.getCars;
        break;
      case 'none':
        return;
    }

    console.log('start');
    if (!this._refreshCars) this._refreshCars = setInterval(() => func(this.state.deps), 3000);
  }

  stopRefreshCars() {
    console.log('stop');
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
  }

  handleCarsChange(value) {
    this.setState({ cars: value });
    this.props.getRoutes(value, this.state.routes);
  }

  handleRoutesChange(value) {
    this.setState({ routes: value });
  }

  handleCheckBoxRealChange(e, data) {
    data.checked && this.getRouteReal();

    this.setState({ showReal: data.checked });
  }

  handleCheckBoxPlanChange(e, data) {
    if (this.state.showReal) this.getRouteReal();

    this.setState({ showPlan: data.checked });
  }

  handleCheckBoxCarsChange(e, data) {
    this.setState({ allCars: data.checked, allDrivers: false, drivers: [] });
    this.handleCarsChange([]);
  }

  handleCheckBoxDriversChange(e, data) {
    this.setState({ allDrivers: data.checked, allCars: false, drivers: [] });
    this.handleCarsChange([]);
  }

  handleCheckBoxTrafficChange(e, data) {
    this.setState({ showTraffic: data.checked });
  }

  handleFromDateChange(event) {
    this.setState({ fromDate: event.target.value });
    // const val = event.target.value;

    // this.setState(prevState => ({ toDate: maxDay(prevState.toDate, val), fromDate: val }));
  }

  handleToDateChange(event) {
    this.setState({ toDate: event.target.value });
    // const val = event.target.value;

    // this.setState(prevState => ({ fromDate: maxDay(prevState.fromDate, val), toDate: val }));
  }

  getRouteReal() {
    this.props.getRouteReal({
      car: this.state.drivers[0] || this.state.cars[0], 
      date_from: moment(this.state.fromDate).isValid() ? moment(this.state.fromDate).format("YYYY-MM-DDTHH:mm:ss") : null, 
      date_to: moment(this.state.toDate).isValid() ? moment(this.state.toDate).format("YYYY-MM-DDTHH:mm:ss") : null
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
      text: `${option.id1} - ${option.delivery_date}`, value: option.id
    }));

    const showCheckbox = this.state.cars.length != 1 && this.state.drivers.length != 1;

    const showRoutes = !this.props.loading && (this.state.drivers.length || this.state.routes.length);
    const showDrivers = this.state.cars.length !== 0 || this.state.allCars;
    const showCars = this.state.drivers.length !== 0 || this.state.allDrivers;

    const carsPos = this.state.allCars ? this.props.cars : this.props.cars.filter(car => this.state.cars.indexOf(car.id) !== -1);
    const driversPos = this.state.allDrivers ? this.props.drivers : this.props.drivers.filter(driver => this.state.drivers.indexOf(driver.id) !== -1);

    const visibleData = driversPos.length ? { data: driversPos, option: 'drivers' } : ( carsPos.length ? { data: carsPos, option: 'cars' } : { data: driversPos, option: 'none' } );

    return (
      <div id="monitoring_container">
        <div id="map_side">
          <GoogleMap
            containerElement={<div style={mapStyle} />}
            mapElement={<div style={mapStyle} />} 
            cars={visibleData}
            startRefresh={this.startRefreshCars}
            stopRefresh={this.stopRefreshCars}
            onMapLoad={this.handleMapLoad}
            center={this.props.center}
            routes={this.props.routes}
            showRoutes={this.state.showPlan && showRoutes}
            real={this.props.real}
            traffic={this.state.showTraffic}
            showReal={this.state.showReal && showRoutes} />
        </div>
        <div id="divider_side" onMouseDown={() => resizeEvent()} />
        <div id="filter_side">
          <div style={{ margin: '10px 10px 2px' }}>

            <Header size="small">Выбор отделов доставки</Header>
            <Dropdown 
              closeOnChange={true} 
              multiple 
              search 
              selection 
              fluid
              noResultsMessage="Отсутствуют элементы" 
              options={deliveryDepsOptions}
              value={this.state.deps}
              onChange={(e, data) => this.handleDepsChange(data.value)} />

            <Header size="small">Выбор водителей</Header>
            <Checkbox 
              className="checkbox_show_all"
              label="Выбрать всех" 
              disabled={showDrivers}
              checked={this.state.allDrivers}
              onChange={this.handleCheckBoxDriversChange} />
            <Dropdown 
              closeOnChange={true} 
              multiple 
              search 
              selection 
              fluid
              noResultsMessage="Отсутствуют элементы" 
              disabled={showDrivers || this.state.allDrivers}
              options={driverOptions}
              value={this.state.drivers}
              onChange={(e, data) => this.handleDriversChange(data.value)} />

            <Header size="small">Выбор ТС</Header>
            <Checkbox 
              className="checkbox_show_all"
              label="Выбрать всех" 
              disabled={showCars}
              checked={this.state.allCars}
              onChange={this.handleCheckBoxCarsChange} />
            <Dropdown 
              closeOnChange={true} 
              multiple 
              search 
              selection 
              fluid
              noResultsMessage="Отсутствуют элементы" 
              disabled={showCars || this.state.allCars}
              options={carsOptions}
              value={this.state.cars}
              onChange={(e, data) => this.handleCarsChange(data.value)} />

            <Header size="small">Выбор маршрутов</Header>
            <Dropdown 
              closeOnChange={true} 
              multiple 
              search 
              selection 
              fluid
              noResultsMessage="Отсутствуют элементы" 
              options={routeOptions} 
              onChange={(e, data) => this.handleRoutesChange(data.value)} />

            <Header size="small">Выбор периода</Header>
            <div style={{ height: '45px' }}>
              <b>начало</b>
              <Input 
                style={{ float: 'right' }} 
                size="mini" 
                type="datetime-local"
                value={this.state.fromDate}
                onChange={this.handleFromDateChange} />
            </div>
            <div style={{ height: '45px' }}>
              <b>конец</b>
              <Input 
                style={{ float: 'right' }} 
                size="mini" 
                type="datetime-local"
                value={this.state.toDate}
                onChange={this.handleToDateChange} />
            </div>

            <div>
              <Checkbox 
                label="Отображать реальный маршрут" 
                disabled={showCheckbox}
                checked={this.state.showReal}
                onChange={this.handleCheckBoxRealChange} />
            </div>
            <div>
              <Checkbox 
                disabled={showCheckbox}
                checked={this.state.showPlan}
                onChange={this.handleCheckBoxPlanChange}
                label="Отображать запланированный маршрут" />
            </div>
            <div>
              <Checkbox 
                checked={this.state.showTraffic}
                onChange={this.handleCheckBoxTrafficChange}
                label="Отображать пробки" />
            </div>

            <Button 
              style={{ marginTop: '20px' }} 
              primary 
              fluid
              loading={this.props.loading}
              disabled={this.props.loading}
              onClick={() => this.submit()}>Применить</Button>
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {
//   fun: PropTypes.func,
//   obj: PropTypes.object,
//   arr: PropTypes.array,
//   bool: PropTypes.bool,
//   num: PropTypes.number,
  deliveryDeps:   PropTypes.array,
  cars:           PropTypes.array,
  drivers:        PropTypes.array,
  routes:         PropTypes.array,
  real:           PropTypes.array,
  loading:        PropTypes.bool,
  center:         PropTypes.object,
  bounds:         PropTypes.object,
  getRouteReal:   PropTypes.func,
  getCars:        PropTypes.func,
  getDrivers:     PropTypes.func,
  getRoutes:      PropTypes.func,
  init:           PropTypes.func,
  startLoading:   PropTypes.func,
  refreshBounds:  PropTypes.func,
};

const mapStateToProps = state => ({
  deliveryDeps:    state.deliveryDeps,
  cars:            state.cars,
  drivers:         state.drivers,
  routes:          state.routes,
  real:            state.real,
  loading:         state.loading,
  center:          state.center,
  bounds:          state.bounds,
});

const mapDispatchToProps = actionsMap;

export default connect(mapStateToProps, mapDispatchToProps)(App);