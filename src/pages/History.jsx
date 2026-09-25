import React, { useState } from 'react';
import { usePlanner } from '../context/LessonPlannerContext';
import { Page, Card, Badge } from '../components/UI';
import './Pages.css';

export default function History() {
  const { data } = usePlanner();

  const [q, setQ] = useState('');
  const [st, setSt] = useState('');

  const all = [
    ...data.history,
    ...data.lessons.filter(
      x => x.status !== 'Planned'
    )
  ].filter(
    x =>
      (x.topic || '')
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!st || x.status === st)
  );

  return (
    <Page
      eyebrow="Records"
      title="Lesson history"
      sub="Search and filter past lesson activity."
    >
      <Card>
        <div className="toolbar">
          <input
            placeholder="Search topic..."
            value={q}
            onChange={e =>
              setQ(e.target.value)
            }
          />

          <select
            value={st}
            onChange={e =>
              setSt(e.target.value)
            }
          >
            <option value="">
              All statuses
            </option>

            {[
              'Completed',
              'Partly Done',
              'Not Done',
              'Rescheduled',
              'Cancelled'
            ].map(x => (
              <option>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  'Date',
                  'Class',
                  'Section',
                  'Subject',
                  'Chapter',
                  'Topic',
                  'Teacher',
                  'Status'
                ].map(x => (
                  <th>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {all.map(x => (
                <tr key={x.id}>
                  <td>
                    {x.date}
                  </td>

                  <td>
                    Class {x.classId?.slice(1)}
                  </td>

                  <td>
                    {x.section}
                  </td>

                  <td>
                    {x.subject}
                  </td>

                  <td>
                    {x.chapter}
                  </td>

                  <td>
                    <b>
                      {x.topic}
                    </b>
                  </td>

                  <td>
                    {x.teacher}
                  </td>

                  <td>
                    <Badge>
                      {x.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}