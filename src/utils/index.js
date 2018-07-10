import moment from 'moment';
import colors from '../constants/colors';

export const getRandomString = () => Math.random().toString(36).substring(7);

export const getRouteColor = routeIndex => colors[routeIndex % colors.length];

export const markerColor = status => {
  switch (status) {
    case 'select': return '#ec048e';
    case 'Отгружен': return '#1dd231';
    case 'Возврат': return '#ef0505';
    case 'Отказ': return '#dea610';
    case 'Акт': return '#109ede';
    default: return '#ff0';
  }
};

const icon = require('../resources/favicon.ico');

export const HTMLNotification = text => {
  const option = { body: 'nav.kopt.org', icon: icon };

  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  else if (Notification.permission === "granted") {
    new Notification(text, option);
  }

  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(permission => {
      // Если пользователь разрешил, то создаем уведомление 
      if (permission === "granted") {
        new Notification(text, option);
      }
    });
  }
};

export const resizeEvent = () => {
  let left = document.getElementById('map_side');
  let right = document.getElementById('filter_side');

  document.onmousemove = e => {
    if(e.preventDefault) e.preventDefault();

    let r1, r2, num = Number(e.clientX / window.innerWidth).toFixed(4);
    if (num < 0.41) { r1 = '0.40'; r2 = '0.60'; } else
    if (num > 0.74) { r1 = '0.75'; r2 = '0.25'; } else {
      r1 = num;
      r2 = 1 - num;
    }
    left.style['flex-grow'] = r1;
    right.style['flex-grow'] = r2;
  };

  document.onmouseup = () => {
    document.onmousedown = () => {};
    document.onmousemove = () => {};
    document.onmouseup = () => {};
  };
};

export const maxDay = (one, two) => {
  if (!one || !two) return one;

  const MAX_DAYS = 5;
  const new_one = moment(one);
  two = moment(two);
  
  const diff = new_one.diff(two, 'days');

  if (Math.abs(diff) >= MAX_DAYS) {
    return diff > 0 ? two.add(MAX_DAYS, 'days').format("YYYY-MM-DDTHH:mm") : two.subtract(MAX_DAYS, 'days').format("YYYY-MM-DDTHH:mm");
  } else return one;
};