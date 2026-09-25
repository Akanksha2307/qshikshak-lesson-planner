import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LessonPlannerProvider } from './context/LessonPlannerContext';
import './index.css';

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <LessonPlannerProvider>
      <App />
    </LessonPlannerProvider>
  </React.StrictMode>
);