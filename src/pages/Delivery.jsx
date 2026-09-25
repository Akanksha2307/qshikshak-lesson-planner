import React, { useState } from 'react';
import { usePlanner } from '../context/LessonPlannerContext';
import {
  Page,
  Card,
  Badge,
  Modal,
  Field
} from '../components/UI';
import './Pages.css';

export default function Delivery() {
  const {
    data,
    completeLesson
  } = usePlanner();

  const [l, setL] = useState(null);

  const [form, setForm] = useState({
    understanding: 'Good',
    remarks: '',
    next: ''
  });

  const save = status => {
    completeLesson(
      l.id,
      status,
      form
    );

    setL(null);
  };

  return (
    <Page
      eyebrow="After class"
      title="Lesson delivery"
      sub="Mark lessons completed, partly done or not done. Unfinished topics auto-shift forward."
    >
      <Card>
        <h3>
          Delivery queue
        </h3>

        {data.lessons
          .filter(x =>
            !['Cancelled'].includes(x.status)
          )
          .slice()
          .sort((a, b) =>
            a.date.localeCompare(b.date)
          )
          .map(x => (
            <div
              className="delivery"
              key={x.id}
            >
              <b>
                P{x.period}

                <small>
                  {x.time}
                </small>
              </b>

              <div>
                <strong>
                  {x.topic}
                </strong>

                <small>
                  {x.chapter}
                  {' · '}
                  {x.subject}
                  {' · Class '}
                  {x.classId.slice(1)}
                  -
                  {x.section}
                </small>
              </div>

              <Badge>
                {x.status}
              </Badge>

              {x.status !== 'Completed' && (
                <button
                  className="btn sm primary"
                  onClick={() =>
                    setL(x)
                  }
                >
                  Mark done
                </button>
              )}
            </div>
          ))}
      </Card>

      {l && (
        <Modal
          title="Complete Lesson"
          onClose={() =>
            setL(null)
          }
        >
          <p className="kicker">
            {l.topic} · {l.date}
          </p>

          <Field label="Topics Covered">
            <input
              value={l.topic}
              readOnly
            />
          </Field>

          <div className="checklist">
            <label>
              <input
                type="checkbox"
                defaultChecked
              />
              {' '}
              Objective 1 achieved
            </label>

            <label>
              <input
                type="checkbox"
                defaultChecked
              />
              {' '}
              Objective 2 achieved
            </label>

            <label>
              <input
                type="checkbox"
              />
              {' '}
              Objective 3 achieved
            </label>
          </div>

          <Field label="Student Understanding">
            <select
              value={form.understanding}
              onChange={e =>
                setForm({
                  ...form,
                  understanding:
                    e.target.value
                })
              }
            >
              {[
                'Good',
                'Average',
                'Needs Improvement'
              ].map(x => (
                <option>
                  {x}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Teacher Remarks">
            <textarea
              onChange={e =>
                setForm({
                  ...form,
                  remarks:
                    e.target.value
                })
              }
            />
          </Field>

          <Field label="Next Lesson">
            <input
              onChange={e =>
                setForm({
                  ...form,
                  next:
                    e.target.value
                })
              }
            />
          </Field>

          <div className="actions top">
            <button
              className="btn primary"
              onClick={() =>
                save('Completed')
              }
            >
              Complete Lesson
            </button>

            <button
              className="btn"
              onClick={() =>
                save('Partly Done')
              }
            >
              Partly Done
            </button>

            <button
              className="btn danger"
              onClick={() =>
                save('Not Done')
              }
            >
              Not Done
            </button>
          </div>
        </Modal>
      )}
    </Page>
  );
}