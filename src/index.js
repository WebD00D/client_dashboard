import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import configureStore from './store/configureStore';
import { StripeProvider } from "react-stripe-elements";
import './index.css';
import App from './App';

const store = configureStore();

render(

    <StripeProvider apiKey="pk_test_7lqS4UFbUpzC9UcGNkZD1rZe">
    <Provider store={store}>
      <App />
      </Provider>
    </StripeProvider>
  ,
  document.getElementById('root')
);
