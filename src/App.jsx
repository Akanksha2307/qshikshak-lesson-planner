import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Layout from './components/Layout';

import Today from './pages/Today';
import Calendar from './pages/Calendar';
import Plans from './pages/Plans';
import Syllabus from './pages/Syllabus';
import Delivery from './pages/Delivery';
import History from './pages/History';
import Examinations from './pages/Examinations';
import Approvals from './pages/Approvals';
import Reports from './pages/Reports';
import Homework from './pages/Homework';
import Holidays from './pages/Holidays';
import Classes from './pages/Classes';

import { usePlanner } from './context/LessonPlannerContext';

export default function App() {
  const { toast } = usePlanner();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Today />}
          />

          <Route
            path="calendar"
            element={<Calendar />}
          />

          <Route
            path="plans"
            element={<Plans />}
          />

          <Route
            path="syllabus"
            element={<Syllabus />}
          />

          <Route
            path="delivery"
            element={<Delivery />}
          />

          <Route
            path="history"
            element={<History />}
          />

          <Route
            path="examinations"
            element={<Examinations />}
          />

          <Route
            path="approvals"
            element={<Approvals />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="homework"
            element={<Homework />}
          />

          <Route
            path="holidays"
            element={<Holidays />}
          />

          <Route
            path="classes"
            element={<Classes />}
          />
        </Route>
      </Routes>

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </BrowserRouter>
  );
}