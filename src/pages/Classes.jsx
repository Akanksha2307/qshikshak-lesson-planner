import React, { useState } from 'react';
import { usePlanner } from '../context/LessonPlannerContext';
import { Page, Card } from '../components/UI';
import './Pages.css';

export default function Classes() {
  const {
    data,
    saveClass,
    deleteClass
  } = usePlanner();

  const [q, setQ] = useState('');
  const [name, setName] = useState('');

  return (
    <Page
      eyebrow="Admin"
      title="Classes & Sections"
      sub="Manage classes and their sections."
    >
      <Card>
        <div className="toolbar">
          <input
            placeholder="New class name"
            value={name}
            onChange={e =>
              setName(e.target.value)
            }
          />

          <button
            className="btn primary"
            onClick={() => {
              if (name) {
                saveClass({
                  name,
                  sections: ['A']
                });

                setName('');
              }
            }}
          >
            Add Class
          </button>

          <input
            placeholder="Search class"
            value={q}
            onChange={e =>
              setQ(e.target.value)
            }
          />
        </div>

        {data.classes
          .filter(c =>
            c.name
              .toLowerCase()
              .includes(q.toLowerCase())
          )
          .map(c => (
            <div className="mini action">
              <div>
                <b>{c.name}</b>

                <span>
                  Sections: {c.sections.join(', ')}
                </span>
              </div>

              <button
                className="btn sm"
                onClick={() => {
                  let s = prompt(
                    'Sections comma separated',
                    c.sections.join(',')
                  );

                  if (s) {
                    saveClass({
                      ...c,
                      sections: s
                        .split(',')
                        .map(x => x.trim())
                    });
                  }
                }}
              >
                Edit Sections
              </button>

              <button
                className="btn sm danger"
                onClick={() =>
                  confirm('Delete class?') &&
                  deleteClass(c.id)
                }
              >
                Delete
              </button>
            </div>
          ))}
      </Card>
    </Page>
  );
}