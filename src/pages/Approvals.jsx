import React, { useState } from 'react';
import { usePlanner } from '../context/LessonPlannerContext';
import { Page, Card, Badge } from '../components/UI';
import './Pages.css';

export default function Approvals() {
  const { data, reviewPlan } = usePlanner();

  const [comments, setComments] = useState({});

  const ps = data.plans.filter(
    p => p.status !== 'Draft'
  );

  return (
    <Page
      eyebrow="HOD workspace"
      title="Plan approvals"
      sub="Review submitted plans, approve them or send them back with a comment."
    >
      <div className="grid">
        {ps.map(p => (
          <Card key={p.id}>
            <div className="plan-head">
              <div>
                <h3>
                  {p.subject} · Class {p.classId.slice(1)}-{p.section}
                </h3>

                <small>
                  {p.teacher} · week {p.weekStart}
                </small>
              </div>

              <Badge>{p.status}</Badge>
            </div>

            <div className="planner-grid compact">
              {data.lessons
                .filter(l => l.planId === p.id)
                .map(l => (
                  <div>
                    <b>{l.topic}</b>

                    <small>
                      {l.date} · P{l.period}
                    </small>
                  </div>
                ))}
            </div>

            {p.status === 'Submitted' && (
              <>
                <textarea
                  placeholder="HOD comment"
                  value={comments[p.id] || ''}
                  onChange={e =>
                    setComments({
                      ...comments,
                      [p.id]: e.target.value
                    })
                  }
                />

                <div className="actions top">
                  <button
                    className="btn primary"
                    onClick={() =>
                      reviewPlan(
                        p.id,
                        'Approved',
                        comments[p.id]
                      )
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn danger"
                    onClick={() =>
                      reviewPlan(
                        p.id,
                        'Sent Back',
                        comments[p.id]
                      )
                    }
                  >
                    Send Back
                  </button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}