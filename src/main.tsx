import React from 'react';
import ReactDOM from 'react-dom/client';
import { ZeroSite } from './site/Site.zero';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ZeroSite />
  </React.StrictMode>
);
