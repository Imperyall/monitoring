import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import configureStore from './store/configureStore';
import App from './containers/App';
import './resources/styles.scss'; // Yep, that's right. You can import SASS/CSS files too! Webpack will run the associated loader and plug this into the page.
// require('./resources/favicon.ico'); // Tell webpack to load favicon.ico
const store = configureStore();

render(
  <AppContainer>
    <App store={store}/>
  </AppContainer>,
  document.getElementById('app')
);

if (module.hot) {
  module.hot.accept('./containers/App', () => {
    const NewRoot = require('./containers/App').default;
    render(
      <AppContainer>
        <NewRoot store={store}/>
      </AppContainer>,
      document.getElementById('app')
    );
  });
}
