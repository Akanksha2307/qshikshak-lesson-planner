import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Plus
} from 'lucide-react';

import { usePlanner } from '../context/LessonPlannerContext';
import {
  Page,
  Card,
  Progress,
  Badge
} from '../components/UI';

import './Pages.css';

export default function Today() {
  const { data } = usePlanner();
  const n = useNavigate();

  const today = '2026-09-23';

  const ls = data.lessons.filter(
    x => x.date === today
  );

  const completed = ls.filter(
    x => x.status === 'Completed'
  ).length;

  const pending = ls.filter(
    x => x.status === 'Planned'
  ).length;

  const done = data.lessons.filter(
    x => x.status === 'Completed'
  ).length;

  const total = Math.max(
    1,
    data.syllabus.flatMap(
      x => x.topics
    ).length
  );

  const pct = Math.round(
    done / total * 100
  );

  return (
    <Page
      eyebrow="Teacher workspace"
      title={`Good afternoon, ${data.settings.userName}`}
      sub="Thursday, 24 September 2026"
      actions={
        <>
          <button
            className="btn"
            onClick={() =>
              n('/calendar')
            }
          >
            <CalendarDays size={15} />
            Calendar
          </button>

          <button
            className="btn primary"
            onClick={() =>
              n('/plans')
            }
          >
            <Plus size={15} />
            Create plan
          </button>
        </>
      }
    >
      <div className="grid cards">
        {[
          [
            'Today’s Lessons',
            ls.length,
            'scheduled'
          ],
          [
            'Completed Lessons',
            completed,
            'today'
          ],
          [
            'Pending Lessons',
            pending,
            'today'
          ],
          [
            'This Week',
            data.lessons.length,
            'lessons'
          ],
          [
            'Syllabus Covered',
            pct + '%',
            'across classes'
          ]
        ].map(x => (
          <Card
            className="stat"
            key={x[0]}
          >
            <span>
              {x[0]}
            </span>

            <b>
              {x[1]}
            </b>

            <small>
              {x[2]}
            </small>
          </Card>
        ))}
      </div>

      <div className="grid two section">
        <Card>
          <h3>
            Today’s schedule
          </h3>

          {ls.length ? (
            ls.map(l => (
              <div
                className="lesson-row"
                key={l.id}
              >
                <b>
                  {l.time}
                </b>

                <i></i>

                <div>
                  <strong>
                    {l.topic}
                  </strong>

                  <small>
                    Class {l.classId.slice(1)}
                    -
                    {l.section}
                    {' · '}
                    {l.subject}
                    {' · '}
                    {l.chapter}
                  </small>
                </div>

                <Badge>
                  {l.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="empty">
              No lessons today.
            </div>
          )}
        </Card>

        <Card>
          <h3>
            Syllabus progress
          </h3>

          {data.syllabus
            .slice(0, 4)
            .map((s, i) => (
              <div
                className="prog"
                key={s.id}
              >
                <div>
                  <b>
                    Class {s.classId.slice(1)}
                    {' · '}
                    {s.subject}
                  </b>

                  <span>
                    {
                      [72, 48, 31, 18][i] ||
                      10
                    }
                    %
                  </span>
                </div>

                <Progress
                  value={
                    [72, 48, 31, 18][i] ||
                    10
                  }
                />
              </div>
            ))}

          <h3 className="mt">
            Upcoming exams
          </h3>

          {data.exams
            .slice(0, 2)
            .map(e => (
              <div
                className="mini"
                key={e.id}
              >
                <b>
                  {e.name}
                </b>

                <span>
                  {e.subject} · {e.date}
                </span>
              </div>
            ))}
        </Card>
      </div>
    </Page>
  );
}