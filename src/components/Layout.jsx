import React, { useState } from 'react';

import {
  NavLink,
  Outlet,
  useLocation
} from 'react-router-dom';

import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  BookMarked,
  CheckCircle2,
  History,
  GraduationCap,
  ShieldCheck,
  BarChart3,
  Palmtree,
  Home,
  Menu,
  Sun,
  Moon,
  UserRound,
  RotateCcw,
  School,
  NotebookTabs,
  Bell
} from 'lucide-react';

import { usePlanner } from '../context/LessonPlannerContext';

import './Layout.css';

const nav = [
  ['Today', '/', Home],
  ['Teaching Calendar', '/calendar', CalendarDays],
  ['Lesson Plans', '/plans', ClipboardList],
  ['Syllabus', '/syllabus', BookMarked],
  ['Class Delivery', '/delivery', CheckCircle2],
  ['Lesson History', '/history', History],
  ['Examinations', '/examinations', GraduationCap],
  ['Approvals', '/approvals', ShieldCheck],
  ['Reports', '/reports', BarChart3],
  ['Homework', '/homework', NotebookTabs],
  ['Holidays', '/holidays', Palmtree],
  ['Classes & Sections', '/classes', School]
];

export default function Layout() {
  const {
    data,
    settings,
    reset
  } = usePlanner();

  const [s, setS] = useState(false);

  const loc = useLocation();

  const role = data.settings.role;

  const allowed =
    role === 'Teacher'
      ? nav.filter(
          x =>
            ![
              'Approvals',
              'Classes & Sections'
            ].includes(x[0])
        )
      : role === 'HOD'
        ? nav.filter(
            x =>
              [
                'Teaching Calendar',
                'Lesson Plans',
                'Approvals',
                'Syllabus',
                'Reports',
                'Examinations'
              ].includes(x[0])
          )
        : role === 'Principal'
          ? nav.filter(
              x =>
                [
                  'Teaching Calendar',
                  'Reports',
                  'Syllabus',
                  'Examinations',
                  'Approvals'
                ].includes(x[0])
            )
          : role === 'Admin'
            ? nav.filter(
                x =>
                  [
                    'Syllabus',
                    'Examinations',
                    'Holidays',
                    'Classes & Sections',
                    'Teaching Calendar',
                    'Reports'
                  ].includes(x[0])
              )
            : nav.filter(
                x =>
                  [
                    'Today',
                    'Homework',
                    'Teaching Calendar'
                  ].includes(x[0])
              );

  return (
    <div className={'app ' + data.settings.theme}>
      <aside className={s ? 'open' : ''}>
        <div className="brand">
          <span>
            Q
          </span>

          <div>
            Qshikshak

            <small>
              Academic Lesson Planner
            </small>
          </div>
        </div>

        <div className="school-chip">
          <School size={16} />

          <div>
            <b>
              Greenfield Public School
            </b>

            <small>
              {data.settings.board}
              {' · '}
              {data.settings.year}
            </small>
          </div>
        </div>

        <nav>
          {allowed.map(
            ([n, p, I]) => (
              <NavLink
                key={n}
                to={p}
                end={p === '/'}
                onClick={() =>
                  setS(false)
                }
              >
                <I size={17} />

                {n}
              </NavLink>
            )
          )}
        </nav>

        <div className="aside-user">
          <b>
            {data.settings.userName}
          </b>

          <small>
            {role}
            {' · '}
            Academic Staff
          </small>
        </div>
      </aside>

      <main>
        <header>
          <button
            className="icon mobile"
            onClick={() =>
              setS(!s)
            }
          >
            <Menu />
          </button>

          <div className="crumb">
            Lesson Planner{' '}

            <b>
              /{' '}
              {loc.pathname === '/'
                ? 'Today'
                : loc.pathname
                    .slice(1)
                    .replace('-', ' ')}
            </b>
          </div>

          <div className="top-controls">
            <select
              value={data.settings.year}
              onChange={e =>
                settings({
                  year: e.target.value
                })
              }
            >
              <option>
                2026-27
              </option>

              <option>
                2027-28
              </option>
            </select>

            <select
              value={data.settings.board}
              onChange={e =>
                settings({
                  board: e.target.value
                })
              }
            >
              <option>
                SSC
              </option>

              <option>
                CBSE
              </option>

              <option>
                ICSE
              </option>
            </select>

            <select
              value={role}
              onChange={e =>
                settings({
                  role: e.target.value
                })
              }
            >
              {[
                'Teacher',
                'HOD',
                'Principal',
                'Admin',
                'Parent'
              ].map(x => (
                <option key={x}>
                  {x}
                </option>
              ))}
            </select>

            <button
              className="icon"
              title="Notifications"
            >
              <Bell />
            </button>

            <button
              className="icon"
              title="Theme"
              onClick={() =>
                settings({
                  theme:
                    data.settings.theme === 'dark'
                      ? 'light'
                      : 'dark'
                })
              }
            >
              {data.settings.theme === 'dark'
                ? <Sun />
                : <Moon />}
            </button>

            <button
              className="icon"
              title="Reset demo"
              onClick={reset}
            >
              <RotateCcw />
            </button>

            <span className="avatar">
              <UserRound />
            </span>
          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}