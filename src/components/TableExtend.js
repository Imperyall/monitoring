import React from 'react';
import { Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { markerColor } from '../utils';

const dateFormat = "DD.MM.YYYY HH:mm";
const MAX_DIFF = 10; //в минутах

const ifMaxDiff = (start, end) => Math.abs(moment(start).diff(moment(end), 'minutes')) > MAX_DIFF ? '#ffc5c5' : 'white';
const showDate = time => moment(time).isValid() ? moment(time).format(dateFormat) : "--//--";

const TableExtend = props => {
  if (props.routes.length == 0) return null;

  return (
    <div>
      {props.routes.map(item => (
        <div key={`t${item.id}`}>
          <h3>Маршрут:</h3>
          <Table color="grey">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Водитель</Table.HeaderCell>
                <Table.HeaderCell>Дата выезда</Table.HeaderCell>
                <Table.HeaderCell>Начало маршрута</Table.HeaderCell>
                <Table.HeaderCell>Окончание маршрута</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell style={{ "cursor": "pointer" }} onClick={() => props.selectRoute([+item.id1])}>{item.id1}</Table.Cell>
                <Table.Cell>{item.driver}</Table.Cell>
                <Table.Cell>{item.delivery_date}</Table.Cell>
                <Table.Cell>{showDate(item.delivered_time_s)}</Table.Cell>
                <Table.Cell>{showDate(item.delivered_time_e)}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          <h3>Точки:</h3>
          <Table color="grey">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>№</Table.HeaderCell>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Заголовок</Table.HeaderCell>
                <Table.HeaderCell>Статус</Table.HeaderCell>
                <Table.HeaderCell>Запланированное время начало</Table.HeaderCell>
                <Table.HeaderCell>Запланированное время конец</Table.HeaderCell>
                <Table.HeaderCell>Фактическое время начало</Table.HeaderCell>
                <Table.HeaderCell>Фактическое время конец</Table.HeaderCell>
                <Table.HeaderCell>Дистанция</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {item.index.map(waypoint => (
                <Table.Row key={`p${waypoint.num}`}>
                  <Table.Cell style={{ "cursor": "pointer" }} onClick={() => props.selectWaypoint(waypoint)}>{waypoint.num}</Table.Cell>
                  <Table.Cell style={{ "cursor": "pointer" }} onClick={() => props.selectWaypoint(waypoint)}>{waypoint.doc}</Table.Cell>
                  <Table.Cell>{waypoint.title}</Table.Cell>
                  <Table.Cell bgcolor={markerColor(waypoint.status)}>{waypoint.status}</Table.Cell>
                  <Table.Cell>{showDate(waypoint.planned_time_s)}</Table.Cell>
                  <Table.Cell>{showDate(waypoint.planned_time_e)}</Table.Cell>
                  <Table.Cell bgcolor={ifMaxDiff(waypoint.delivered_time_s, waypoint.planned_time_s)}>{showDate(waypoint.delivered_time_s)}</Table.Cell>
                  <Table.Cell bgcolor={ifMaxDiff(waypoint.delivered_time_e, waypoint.planned_time_e)}>{showDate(waypoint.delivered_time_e)}</Table.Cell>
                  <Table.Cell style={{ textAlign: 'right' }}>{(waypoint.distance / 1000).toFixed(1)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ))}
    </div>
  );
};

TableExtend.propTypes = {
  routes:   PropTypes.array,
};

export default TableExtend;