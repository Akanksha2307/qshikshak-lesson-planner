import React, { useState } from 'react';
import { usePlanner } from '../context/LessonPlannerContext';
import { Page, Card, Field } from '../components/UI';
import './Pages.css';

export default function Holidays() {
  const {
    data,
    addHoliday,
    deleteHoliday
  } = usePlanner();

  const [f, setF] = useState({
    name: '',
    date: '',
    description: ''
  });

  return (
    <Page
      eyebrow="Admin"
      title="Holiday Management"
      sub="Holiday dates appear in Calendar and are skipped while generating lesson plans."
    >
      <div className="grid two">
        <Card>
          <h3>
            Add holiday
          </h3>

          <Field label="Name">
            <input
              value={f.name}
              onChange={e =>
                setF({
                  ...f,
                  name: e.target.value
                })
              }
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={f.date}
              onChange={e =>
                setF({
                  ...f,
                  date: e.target.value
                })
              }
            />
          </Field>

          <Field label="Description">
            <textarea
              value={f.description}
              onChange={e =>
                setF({
                  ...f,
                  description: e.target.value
                })
              }
            />
          </Field>

          <button
            className="btn primary top"
            disabled={!f.name || !f.date}
            onClick={() => {
              addHoliday(f);

              setF({
                name: '',
                date: '',
                description: ''
              });
            }}
          >
            + Add Holiday
          </button>
        </Card>

        <Card>
          <h3>
            Configured holidays
          </h3>

          {data.holidays.map(h => (
            <div
              className="mini action"
              key={h.id}
            >
              <div>
                <b>
                  {h.name}
                </b>

                <span>
                  {h.date} · {h.description}
                </span>
              </div>

              <button
                className="btn sm danger"
                onClick={() =>
                  confirm('Delete holiday?') &&
                  deleteHoliday(h.id)
                }
              >
                Delete
              </button>
            </div>
          ))}
        </Card>
      </div>
    </Page>
  );
}