import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

import { usePlanner } from '../context/LessonPlannerContext';
import {
  Page,
  Card,
  Badge,
  Modal,
  Field
} from '../components/UI';

import './Pages.css';

const times = [
  '08:30–09:15',
  '09:15–10:00',
  '10:00–10:45',
  '11:00–11:45',
  '11:45–12:30',
  '13:15–14:00'
];

const iso = d => {
  let x = new Date(d);

  x.setMinutes(
    x.getMinutes() - x.getTimezoneOffset()
  );

  return x.toISOString().slice(0, 10);
};

const monday = d => {
  let x = new Date(d + 'T00:00');
  let day = x.getDay() || 7;

  x.setDate(
    x.getDate() - day + 1
  );

  return x;
};

export default function Calendar() {
  const {
    data,
    reschedule,
    cancelLesson
  } = usePlanner();

  const [view, setView] = useState('Week');

  const [anchor, setAnchor] = useState(
    '2026-09-21'
  );

  const [sel, setSel] = useState(null);

  const [rf, setRf] = useState({
    date: '',
    period: 1,
    reason: ''
  });

  const days = useMemo(() => {
    let m = monday(anchor);

    return Array.from(
      { length: 6 },
      (_, i) => {
        let d = new Date(m);

        d.setDate(
          m.getDate() + i
        );

        return iso(d);
      }
    );
  }, [anchor]);

  const shift = n => {
    let d = new Date(
      anchor + 'T00:00'
    );

    d.setDate(
      d.getDate() +
        n *
          (
            view === 'Month'
              ? 30
              : view === 'Day'
                ? 1
                : 7
          )
    );

    setAnchor(
      iso(d)
    );
  };

  const lesson = (d, p) =>
    data.lessons.find(
      x =>
        x.date === d &&
        +x.period === p
    );

  const holiday = d =>
    data.holidays.find(
      x => x.date === d
    );

  const exam = d =>
    data.exams.find(x => {
      let a =
        x.startDate || x.date;

      let b =
        x.endDate || a;

      return d >= a && d <= b;
    });

  return (
    <Page
      eyebrow="Academic schedule"
      title="Teaching Calendar"
      sub="A school timetable view combining periods, planned topics, holidays and examination blocks."
      actions={
        <div className="calendar-actions">
          <button
            className="btn"
            onClick={() => shift(-1)}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            className="btn"
            onClick={() =>
              setAnchor('2026-09-23')
            }
          >
            Today
          </button>

          <button
            className="btn"
            onClick={() => shift(1)}
          >
            <ChevronRight size={16} />
          </button>

          <div className="tabs">
            {[
              'Day',
              'Week',
              'Month'
            ].map(x => (
              <button
                key={x}
                className={
                  'btn ' +
                  (
                    view === x
                      ? 'primary'
                      : ''
                  )
                }
                onClick={() =>
                  setView(x)
                }
              >
                {x}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="calendar-summary">
        <span>
          <i className="dot planned" />
          {' '}
          Planned lesson
        </span>

        <span>
          <i className="dot completed" />
          {' '}
          Completed
        </span>

        <span>
          <i className="dot holiday" />
          {' '}
          Holiday
        </span>

        <span>
          <i className="dot exam" />
          {' '}
          Examination
        </span>

        <span>
          <b>6</b> periods/day
        </span>
      </div>

      <Card className="calendar-card">
        {view === 'Month' ? (
          <div className="school-month">
            {Array.from(
              { length: 35 },
              (_, i) => {
                let first = new Date(
                  anchor.slice(0, 7) +
                    '-01T00:00'
                );

                let start = new Date(
                  first
                );

                start.setDate(
                  1 -
                    (first.getDay() || 7) +
                    1 +
                    i
                );

                let d = iso(start);
                let h = holiday(d);
                let e = exam(d);

                let ls =
                  data.lessons.filter(
                    x => x.date === d
                  );

                return (
                  <div
                    className={
                      (
                        d.slice(0, 7) !==
                        anchor.slice(0, 7)
                          ? 'outside '
                          : ''
                      ) +
                      (
                        h
                          ? 'is-holiday '
                          : ''
                      ) +
                      (
                        e
                          ? 'is-exam'
                          : ''
                      )
                    }
                  >
                    <strong>
                      {start.getDate()}
                    </strong>

                    <small>
                      {start.toLocaleDateString(
                        'en',
                        {
                          weekday: 'short'
                        }
                      )}
                    </small>

                    {h && (
                      <em>
                        {h.name}
                      </em>
                    )}

                    {e && !h && (
                      <em>
                        {e.name}
                      </em>
                    )}

                    {ls
                      .slice(0, 3)
                      .map(l => (
                        <button
                          onClick={() =>
                            setSel(l)
                          }
                        >
                          {l.subject}: {l.topic}
                        </button>
                      ))}
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="timetable-wrap">
            <div
              className="school-timetable"
              style={{
                gridTemplateColumns:
                  `118px repeat(${
                    view === 'Day'
                      ? 1
                      : 6
                  }, minmax(175px,1fr))`
              }}
            >
              <div className="tt-corner">
                <CalendarDays size={18} />

                <b>
                  Period / Time
                </b>
              </div>

              {(view === 'Day'
                ? [anchor]
                : days
              ).map(d => (
                <div className="tt-day">
                  <b>
                    {new Date(
                      d + 'T00:00'
                    ).toLocaleDateString(
                      'en',
                      {
                        weekday: 'long'
                      }
                    )}
                  </b>

                  <span>
                    {new Date(
                      d + 'T00:00'
                    ).toLocaleDateString(
                      'en',
                      {
                        day: '2-digit',
                        month: 'short'
                      }
                    )}
                  </span>
                </div>
              ))}

              {times.map((t, i) => (
                <React.Fragment key={t}>
                  <div className="tt-time">
                    <b>
                      Period {i + 1}
                    </b>

                    <span>
                      {t}
                    </span>
                  </div>

                  {(view === 'Day'
                    ? [anchor]
                    : days
                  ).map(d => {
                    let h = holiday(d);
                    let e = exam(d);
                    let l = lesson(
                      d,
                      i + 1
                    );

                    return (
                      <div
                        className={
                          'tt-cell ' +
                          (
                            h
                              ? 'blocked holiday-cell'
                              : e
                                ? 'blocked exam-cell'
                                : ''
                          )
                        }
                      >
                        {h ? (
                          <div>
                            <b>
                              {h.name}
                            </b>

                            <span>
                              School Holiday
                            </span>
                          </div>
                        ) : e ? (
                          <div>
                            <b>
                              {e.name}
                            </b>

                            <span>
                              No regular teaching
                            </span>
                          </div>
                        ) : l ? (
                          <button
                            className={
                              'lesson-block ' +
                              l.status
                                .toLowerCase()
                                .replaceAll(
                                  ' ',
                                  '-'
                                )
                            }
                            onClick={() =>
                              setSel(l)
                            }
                          >
                            <small>
                              {l.subject}
                              {' · '}
                              {
                                data.classes.find(
                                  c =>
                                    c.id ===
                                    l.classId
                                )?.name
                              }
                              {' '}
                              {l.section}
                            </small>

                            <b>
                              {l.topic}
                            </b>

                            <span>
                              {l.chapter}
                            </span>

                            <em>
                              {l.teacher}
                              {' · '}
                              {l.status}
                            </em>
                          </button>
                        ) : (
                          <div className="free-slot">
                            <span>
                              Available period
                            </span>

                            <small>
                              No lesson assigned
                            </small>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </Card>

      {sel && (
        <Modal
          title="Lesson & period details"
          onClose={() =>
            setSel(null)
          }
          wide
        >
          <div className="lesson-detail-head">
            <div>
              <span className="kicker">
                {sel.date}
                {' · Period '}
                {sel.period}
                {' · '}
                {times[sel.period - 1]}
              </span>

              <h2>
                {sel.topic}
              </h2>

              <p>
                {sel.subject}
                {' · '}
                {
                  data.classes.find(
                    c =>
                      c.id ===
                      sel.classId
                  )?.name
                }
                {' '}
                {sel.section}
                {' · '}
                {sel.chapter}
              </p>
            </div>

            <Badge>
              {sel.status}
            </Badge>
          </div>

          <div className="detail-grid">
            <div>
              <small>
                Learning objective
              </small>

              <p>
                {sel.objectives ||
                  'Add objectives in Lesson Plans.'}
              </p>
            </div>

            <div>
              <small>
                Teaching method
              </small>

              <p>
                {sel.method ||
                  'Not specified'}
              </p>
            </div>

            <div>
              <small>
                Homework
              </small>

              <p>
                {sel.homework ||
                  'No homework assigned'}
              </p>
            </div>

            <div>
              <small>
                Teacher
              </small>

              <p>
                {sel.teacher}
              </p>
            </div>
          </div>

          <div className="subform">
            <h3>
              Reschedule period
            </h3>

            <div className="form-grid">
              <Field label="New date">
                <input
                  type="date"
                  value={rf.date}
                  onChange={e =>
                    setRf({
                      ...rf,
                      date: e.target.value
                    })
                  }
                />
              </Field>

              <Field label="New period">
                <select
                  value={rf.period}
                  onChange={e =>
                    setRf({
                      ...rf,
                      period:
                        +e.target.value
                    })
                  }
                >
                  {times.map(
                    (t, i) => (
                      <option
                        value={i + 1}
                      >
                        Period {i + 1}
                        {' · '}
                        {t}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Reason">
                <input
                  value={rf.reason}
                  onChange={e =>
                    setRf({
                      ...rf,
                      reason:
                        e.target.value
                    })
                  }
                />
              </Field>
            </div>

            <div className="actions top">
              <button
                className="btn primary"
                disabled={!rf.date}
                onClick={() => {
                  reschedule(
                    sel.id,
                    rf.date,
                    rf.period,
                    rf.reason
                  );

                  setSel(null);
                }}
              >
                Save reschedule
              </button>

              <button
                className="btn danger"
                onClick={() => {
                  if (
                    confirm(
                      'Cancel this lesson?'
                    )
                  ) {
                    cancelLesson(
                      sel.id
                    );

                    setSel(null);
                  }
                }}
              >
                Cancel lesson
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Page>
  );
}