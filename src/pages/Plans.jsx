import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Send,
  Trash2
} from 'lucide-react';

import { usePlanner } from '../context/LessonPlannerContext';
import {
  Page,
  Card,
  Field,
  Badge,
  Modal
} from '../components/UI';

import './Pages.css';

export default function Plans() {
  const {
    data,
    generatePlan,
    submitPlan,
    saveLesson,
    deletePlan
  } = usePlanner();

  const [f, setF] = useState({
    classId: 'c8',
    section: 'A',
    subject: 'Mathematics',
    weekStart: '2026-09-28'
  });

  const [edit, setEdit] = useState(null);

  const cls = data.classes.find(
    c => c.id === f.classId
  );

  const subjects =
    data.subjects.find(
      s => s.classId === f.classId
    )?.items || [];

  const available = useMemo(
    () =>
      data.syllabus.filter(
        s =>
          s.classId === f.classId &&
          s.subject === f.subject &&
          s.board === data.settings.board
      ),
    [data, f]
  );

  return (
    <Page
      eyebrow="Teacher workspace"
      title="Lesson Plans"
      sub="Build period-wise plans from raw syllabus data, enrich lesson details and send the weekly plan to the HOD."
      actions={
        <button
          className="btn primary"
          onClick={() => generatePlan(f)}
        >
          <Sparkles size={16} />
          Auto-plan week
        </button>
      }
    >
      <Card>
        <div className="form-grid plan-filters">
          <Field label="Class">
            <select
              value={f.classId}
              onChange={e => {
                let id = e.target.value;

                let s =
                  data.subjects.find(
                    x => x.classId === id
                  )?.items?.[0] || '';

                setF({
                  ...f,
                  classId: id,
                  section:
                    data.classes.find(
                      c => c.id === id
                    )?.sections?.[0] || 'A',
                  subject: s
                });
              }}
            >
              {data.classes.map(c => (
                <option value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Section">
            <select
              value={f.section}
              onChange={e =>
                setF({
                  ...f,
                  section: e.target.value
                })
              }
            >
              {(cls?.sections || []).map(x => (
                <option>
                  {x}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subject">
            <select
              value={f.subject}
              onChange={e =>
                setF({
                  ...f,
                  subject: e.target.value
                })
              }
            >
              {subjects.map(x => (
                <option>
                  {x}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Week starting">
            <input
              type="date"
              value={f.weekStart}
              onChange={e =>
                setF({
                  ...f,
                  weekStart: e.target.value
                })
              }
            />
          </Field>
        </div>

        <div className="plan-source">
          <b>
            {available.length} syllabus chapters available
          </b>

          <span>
            Planner skips holidays/exam dates and assigns topics in
            sequence. You can edit objectives, resources, method and
            homework after generation.
          </span>
        </div>
      </Card>

      <div className="section">
        {data.plans.length === 0 && (
          <Card>
            <div className="empty">
              <h3>
                No generated weekly plans yet
              </h3>

              <p>
                Select a class, section, subject and week, then use
                Auto-plan week.
              </p>
            </div>
          </Card>
        )}

        {data.plans
          .slice()
          .reverse()
          .map(p => (
            <Card
              key={p.id}
              className="plan"
            >
              <div className="plan-head">
                <div>
                  <span className="kicker">
                    {p.board} · {p.weekStart}
                  </span>

                  <h3>
                    {p.subject} ·{' '}
                    {
                      data.classes.find(
                        c => c.id === p.classId
                      )?.name
                    }{' '}
                    {p.section}
                  </h3>

                  <small>
                    Teacher: {p.teacher}
                  </small>
                </div>

                <div className="actions">
                  <Badge>
                    {p.status}
                  </Badge>

                  {p.status === 'Draft' && (
                    <button
                      className="btn sm primary"
                      onClick={() =>
                        submitPlan(p.id)
                      }
                    >
                      <Send size={14} />
                      Submit
                    </button>
                  )}

                  <button
                    className="btn sm"
                    onClick={() =>
                      confirm(
                        'Delete this generated plan?'
                      ) && deletePlan(p.id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="plan-table">
                <div className="plan-table-head">
                  <span>
                    Period
                  </span>

                  <span>
                    Topic / chapter
                  </span>

                  <span>
                    Lesson preparation
                  </span>

                  <span>
                    Status
                  </span>
                </div>

                {data.lessons
                  .filter(
                    l => l.planId === p.id
                  )
                  .map(l => (
                    <button
                      key={l.id}
                      onClick={() =>
                        setEdit(l)
                      }
                    >
                      <span>
                        <b>
                          {l.day} · P{l.period}
                        </b>

                        <small>
                          {l.date} · {l.time}
                        </small>
                      </span>

                      <span>
                        <b>
                          {l.topic}
                        </b>

                        <small>
                          {l.chapter}
                        </small>
                      </span>

                      <span>
                        <small>
                          {l.objectives
                            ? 'Objective ready'
                            : 'Add objective'}
                          {' · '}
                          {l.method || 'Method'}
                          {' · '}
                          {l.homework
                            ? 'HW ready'
                            : 'No HW'}
                        </small>
                      </span>

                      <Badge>
                        {l.status}
                      </Badge>
                    </button>
                  ))}
              </div>
            </Card>
          ))}
      </div>

      {edit && (
        <Modal
          title="Prepare lesson"
          onClose={() =>
            setEdit(null)
          }
          wide
        >
          <div className="form-grid">
            <Field label="Topic">
              <input
                value={edit.topic}
                onChange={e =>
                  setEdit({
                    ...edit,
                    topic: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Teaching method">
              <select
                value={edit.method || 'Lecture'}
                onChange={e =>
                  setEdit({
                    ...edit,
                    method: e.target.value
                  })
                }
              >
                {[
                  'Lecture',
                  'Discussion',
                  'Demonstration',
                  'Activity',
                  'Group Work',
                  'Practical',
                  'Question & Answer',
                  'Project Based',
                  'Other'
                ].map(x => (
                  <option>
                    {x}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Learning objectives">
              <textarea
                value={edit.objectives || ''}
                onChange={e =>
                  setEdit({
                    ...edit,
                    objectives: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Prerequisites">
              <textarea
                value={edit.prerequisites || ''}
                onChange={e =>
                  setEdit({
                    ...edit,
                    prerequisites: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Resources / teaching aids">
              <textarea
                value={edit.resources || ''}
                onChange={e =>
                  setEdit({
                    ...edit,
                    resources: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Homework / follow-up">
              <textarea
                value={edit.homework || ''}
                onChange={e =>
                  setEdit({
                    ...edit,
                    homework: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Assessment / exit check">
              <textarea
                value={edit.assessment || ''}
                onChange={e =>
                  setEdit({
                    ...edit,
                    assessment: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Teacher notes">
              <textarea
                value={edit.notes || ''}
                onChange={e =>
                  setEdit({
                    ...edit,
                    notes: e.target.value
                  })
                }
              />
            </Field>
          </div>

          <div className="actions top">
            <button
              className="btn primary"
              onClick={() => {
                saveLesson(edit);
                setEdit(null);
              }}
            >
              Save lesson preparation
            </button>
          </div>
        </Modal>
      )}
    </Page>
  );
}