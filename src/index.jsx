import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';

import { PhoneSelector } from './phone-selector.jsx';

console.log("Running index.js...");
ReactDOM.render(
  <PhoneSelector onSelect={(selection) => {console.log(selection, "selected!")}} />,
  document.getElementById('app-container')
);