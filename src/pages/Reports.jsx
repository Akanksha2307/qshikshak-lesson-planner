import React from 'react';
import { usePlanner } from '../context/LessonPlannerContext';
import {
  Page,
  Card,
  Progress
} from '../components/UI';
import './Pages.css';

export default function Reports() {
  const { data } = usePlanner();

  const counts = s =>
    data.lessons.filter(
      x => x.status === s
    ).length;

  return (
    <Page
      eyebrow="Analytics"
      title="Reports"
      sub="Syllabus, class, subject and teacher-wise lesson progress."
    >
      <div className="grid cards">
        {[
          'Completed',
          'Planned',
          'Partly Done',
          'Cancelled',
          'Rescheduled'
        ].map(s => (
          <Card className="stat">
            <span>
              {s} lessons
            </span>

            <b>
              {counts(s)}
            </b>
          </Card>
        ))}
      </div>

      <div className="grid two section">
        <Card>
          <h3>
            Chapter-wise progress
          </h3>

          {data.syllabus.map((s, i) => {
            let done = data.lessons.filter(
              l =>
                l.chapter === s.chapter &&
                l.status === 'Completed'
            ).length;

            let p = Math.min(
              100,
              Math.round(
                done /
                  Math.max(
                    1,
                    s.topics.length
                  ) *
                  100
              )
            );

            return (
              <div className="prog">
                <div>
                  <b>
                    {s.chapter}
                  </b>

                  <span>
                    {p}%
                  </span>
                </div>

                <Progress value={p} />
              </div>
            );
          })}
        </Card>

        <Card>
          <h3>
            Exam readiness
          </h3>

          {data.exams.map(e => (
            <div className="mini">
              <b>
                {e.name}
              </b>

              <span>
                {e.subject}
                {' · '}
                {e.date}
                {' · '}
                {e.syllabus.length} chapters selected
              </span>
            </div>
          ))}

          <button
            className="btn top"
            onClick={() =>
              window.print()
            }
          >
            Print / Export report
          </button>
        </Card>
      </div>
    </Page>
  );
}