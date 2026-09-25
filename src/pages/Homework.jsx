import React, { useState } from 'react';
import { usePlanner } from '../context/LessonPlannerContext';
import {
  Page,
  Card,
  Field,
  Modal,
  Badge
} from '../components/UI';
import './Pages.css';

export default function Homework() {
  const {
    data,
    saveHomework,
    delHomework
  } = usePlanner();

  const [h, setH] = useState(null);

  return (
    <Page
      eyebrow={
        data.settings.role === 'Parent'
          ? 'Parent view'
          : 'Teacher workspace'
      }
      title="Homework"
      sub="Homework connected to lessons and visible to parents."
      actions={
        data.settings.role !== 'Parent' && (
          <button
            className="btn primary"
            onClick={() =>
              setH({
                title: '',
                description: '',
                dueDate: '',
                classId: 'c8',
                subject: 'Science',
                lesson: '',
                done: false
              })
            }
          >
            + Add Homework
          </button>
        )
      }
    >
      <div className="grid three">
        {data.homework.map(x => (
          <Card>
            <Badge>
              {x.done
                ? 'Complete'
                : 'Pending'}
            </Badge>

            <h3>
              {x.title}
            </h3>

            <p>
              {x.description}
            </p>

            <small>
              Due {x.dueDate}
              {' · Class '}
              {x.classId.slice(1)}
              {' · '}
              {x.subject}
            </small>

            {data.settings.role !== 'Parent' && (
              <div className="actions top">
                <button
                  className="btn sm"
                  onClick={() =>
                    saveHomework({
                      ...x,
                      done: !x.done
                    })
                  }
                >
                  {x.done
                    ? 'Reopen'
                    : 'Mark Complete'}
                </button>

                <button
                  className="btn sm"
                  onClick={() =>
                    setH({ ...x })
                  }
                >
                  Edit
                </button>

                <button
                  className="btn sm danger"
                  onClick={() =>
                    delHomework(x.id)
                  }
                >
                  Delete
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {h && (
        <Modal
          title="Homework"
          onClose={() =>
            setH(null)
          }
        >
          <Field label="Title">
            <input
              value={h.title}
              onChange={e =>
                setH({
                  ...h,
                  title: e.target.value
                })
              }
            />
          </Field>

          <Field label="Description">
            <textarea
              value={h.description}
              onChange={e =>
                setH({
                  ...h,
                  description: e.target.value
                })
              }
            />
          </Field>

          <Field label="Due date">
            <input
              type="date"
              value={h.dueDate}
              onChange={e =>
                setH({
                  ...h,
                  dueDate: e.target.value
                })
              }
            />
          </Field>

          <button
            className="btn primary top"
            onClick={() => {
              saveHomework(h);
              setH(null);
            }}
          >
            Save
          </button>
        </Modal>
      )}
    </Page>
  );
}