import React, { useState } from 'react';
import { usePlanner } from '../context/LessonPlannerContext';
import {
  Page,
  Card,
  Field,
  Modal,
  Progress
} from '../components/UI';
import './Pages.css';

const calc = (e, holidays, ppd) => {
  if (!e.date) return 0;

  let now = new Date('2026-09-23');
  let end = new Date(e.date);
  let days = 0;

  for (
    let d = new Date(now);
    d < end;
    d.setDate(d.getDate() + 1)
  ) {
    let ds = d.toISOString().slice(0, 10);

    if (
      d.getDay() !== 0 &&
      !holidays.some(h => h.date === ds)
    ) {
      days++;
    }
  }

  return Math.max(
    0,
    days * Math.max(
      1,
      Math.round(ppd / 3)
    )
  );
};

export default function Examinations() {
  const {
    data,
    saveExam,
    deleteExam
  } = usePlanner();

  const [e, setE] = useState(null);

  const fresh = () =>
    setE({
      name: 'Quarterly Examination',
      classId: 'c8',
      section: 'A',
      subject: 'Mathematics',
      date: '2026-11-15',
      startDate: '2026-11-15',
      endDate: '2026-11-22',
      required: 30,
      revision: 6,
      syllabus: []
    });

  return (
    <Page
      eyebrow="Assessment planning"
      title="Examinations"
      sub="Quarterly, Half-Yearly and Final exams connected to syllabus and lesson planning."
      actions={
        <button
          className="btn primary"
          onClick={fresh}
        >
          + Add Exam
        </button>
      }
    >
      <div className="grid three">
        {data.exams.map(x => {
          let av = calc(
            x,
            data.holidays,
            data.settings.periodsPerDay
          );

          let rem =
            av -
            (+x.required || 0) -
            (+x.revision || 0);

          return (
            <Card key={x.id}>
              <small>
                {x.name}
              </small>

              <h3>
                {x.subject} · Class {x.classId.slice(1)}-{x.section}
              </h3>

              <b className="date">
                {x.date}
              </b>

              <div className="exam-stats">
                <span>
                  Available <b>{av}</b>
                </span>

                <span>
                  Required <b>{x.required}</b>
                </span>

                <span>
                  Revision <b>{x.revision}</b>
                </span>

                <span>
                  Remaining <b>{rem}</b>
                </span>
              </div>

              {rem < 0 && (
                <p className="warning">
                  Not enough teaching classes before exam.
                </p>
              )}

              <Progress
                value={Math.min(
                  100,
                  (x.syllabus?.length || 0) * 20
                )}
              />

              <div className="actions top">
                <button
                  className="btn sm"
                  onClick={() =>
                    setE({ ...x })
                  }
                >
                  View / Edit
                </button>

                <button
                  className="btn sm danger"
                  onClick={() =>
                    confirm('Delete exam?') &&
                    deleteExam(x.id)
                  }
                >
                  Delete
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {e && (
        <Modal
          wide
          title={
            e.id
              ? 'Edit examination'
              : 'Create examination'
          }
          onClose={() =>
            setE(null)
          }
        >
          <div className="form-grid">
            <Field label="Exam Name">
              <select
                value={e.name}
                onChange={x =>
                  setE({
                    ...e,
                    name: x.target.value
                  })
                }
              >
                {[
                  'Quarterly Examination',
                  'Half-Yearly Examination',
                  'Final Examination'
                ].map(x => (
                  <option>
                    {x}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Exam Date">
              <input
                type="date"
                value={e.date}
                onChange={x =>
                  setE({
                    ...e,
                    date: x.target.value
                  })
                }
              />
            </Field>

            <Field label="Class">
              <select
                value={e.classId}
                onChange={x =>
                  setE({
                    ...e,
                    classId: x.target.value
                  })
                }
              >
                {data.classes.map(c => (
                  <option value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subject">
              <input
                value={e.subject}
                onChange={x =>
                  setE({
                    ...e,
                    subject: x.target.value
                  })
                }
              />
            </Field>

            <Field label="Required Teaching Classes">
              <input
                type="number"
                value={e.required}
                onChange={x =>
                  setE({
                    ...e,
                    required: +x.target.value
                  })
                }
              />
            </Field>

            <Field label="Revision Classes">
              <input
                type="number"
                value={e.revision}
                onChange={x =>
                  setE({
                    ...e,
                    revision: +x.target.value
                  })
                }
              />
            </Field>
          </div>

          <h3 className="mt">
            Exam-wise syllabus
          </h3>

          <div className="checklist">
            {data.syllabus
              .filter(
                s =>
                  s.classId === e.classId &&
                  s.subject === e.subject
              )
              .map(s => (
                <label>
                  <input
                    type="checkbox"
                    checked={
                      e.syllabus.includes(
                        s.chapter
                      )
                    }
                    onChange={x =>
                      setE({
                        ...e,
                        syllabus:
                          x.target.checked
                            ? [
                                ...e.syllabus,
                                s.chapter
                              ]
                            : e.syllabus.filter(
                                z =>
                                  z !== s.chapter
                              )
                      })
                    }
                  />

                  {s.chapter}
                </label>
              ))}
          </div>

          <div className="actions top">
            <button
              className="btn primary"
              onClick={() => {
                saveExam(e);
                setE(null);
              }}
            >
              Save Exam
            </button>
          </div>
        </Modal>
      )}
    </Page>
  );
}