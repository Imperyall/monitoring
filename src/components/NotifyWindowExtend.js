import React from 'react';
// import PropTypes from 'prop-types';
// import moment from 'moment';
import { Button } from 'semantic-ui-react';
import { HTMLNotification } from '../utils';

class NotifyWindowExtend extends React.Component {
  constructor() {
    super();

    this.handleOpen = this.handleOpen.bind(this);

    this.state = { open: false };
  }

  handleOpen(close) {
    this.setState(prevState => ({ open: close ? false : !prevState.open }));
  }

  render () {
    return (
      <div className="notify-container" style={{ display: this.state.open ? 'flex' : 'none' }}>
        <div className="notify-background" />
        <div className="notify-box">
          <h4>Оповещение:</h4>
          <div>
            <div><span>Автомобиль:</span> <span>тест</span></div>
            <div><span>гос. №:</span> <span>тест</span></div>
            <div><span>Водитель:</span> <span>тест</span></div>
            <div><span>тел.:</span> <span>тест</span></div>
            <div><span>Отдел доставки:</span> <span>тест</span></div>
            <div><span>Маршрут:</span> <span>тест</span></div>
            <div><span>№ документа доставки:</span> <span>тест</span></div>
            <div><span>Время:</span> <span>тест</span></div>
            <div className="notify-button-box">
              <Button
                positive
                onClick={() => HTMLNotification('тест')}
                 >Показать на карте</Button>
              <Button
                onClick={() => this.handleOpen(true)}
                positive
                 >Закрыть</Button>
              <Button
                positive
                 >Позвонить</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// NotifyWindowExtend.propTypes = {
  // data:   PropTypes.object,
  // index:  PropTypes.number,
// };

export default NotifyWindowExtend;