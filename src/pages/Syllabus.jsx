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

export default function Syllabus() {
  const {
    data,
    saveSyllabus,
    deleteSyllabus
  } = usePlanner();

  const [q, setQ] = useState('');
  const [board, setBoard] = useState(data.settings.board);
  const [cls, setCls] = useState('c8');
  const [edit, setEdit] = useState(null);

  const rows = data.syllabus.filter(
    s =>
      s.board === board &&
      s.classId === cls &&
      s.chapter
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  const open = s =>
    setEdit(
      s
        ? JSON.parse(JSON.stringify(s))
        : {
            board,
            classId: cls,
            subject: 'Science',
            chapter: '',
            topics: []
          }
    );

  const topic = () =>
    setEdit({
      ...edit,
      topics: [
        ...edit.topics,
        {
          id: 't' + Date.now(),
          name: 'New topic',
          sub: '',
          periods: 1
        }
      ]
    });

  return (
    <Page
      eyebrow="Curriculum"
      title="Syllabus"
      sub="Editable syllabus copies for SSC, CBSE and ICSE, for every class."
      actions={
        <button
          className="btn primary"
          onClick={() => open()}
        >
          + Add chapter
        </button>
      }
    >
      <Card>
        <div className="toolbar">
          <select
            value={board}
            onChange={e =>
              setBoard(e.target.value)
            }
          >
            {[
              'SSC',
              'CBSE',
              'ICSE'
            ].map(x => (
              <option>
                {x}
              </option>
            ))}
          </select>

          <select
            value={cls}
            onChange={e =>
              setCls(e.target.value)
            }
          >
            {data.classes.map(c => (
              <option value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Search chapters..."
            value={q}
            onChange={e =>
              setQ(e.target.value)
            }
          />
        </div>

        {rows.length ? (
          rows.map((s, i) => (
            <div
              className="chapter"
              key={s.id}
            >
              <div className="chapter-head">
                <span>
                  {i + 1}
                </span>

                <div>
                  <h3>
                    {s.chapter}
                  </h3>

                  <small>
                    {s.subject}
                    {' · '}
                    {s.board}
                    {' · '}
                    {s.topics.length} topics
                  </small>
                </div>

                <div className="grow"></div>

                <button
                  className="btn sm"
                  onClick={() =>
                    open(s)
                  }
                >
                  Edit
                </button>

                <button
                  className="btn sm danger"
                  onClick={() =>
                    confirm(
                      'Delete chapter?'
                    ) &&
                    deleteSyllabus(s.id)
                  }
                >
                  Delete
                </button>
              </div>

              <div className="topic-table">
                {s.topics.map((t, j) => (
                  <div key={t.id}>
                    <b>
                      {t.name}
                    </b>

                    <span>
                      {t.sub}
                    </span>

                    <em>
                      {t.periods} period
                      {t.periods > 1
                        ? 's'
                        : ''}
                    </em>
                  </div>
                ))}
              </div>

              <Progress
                value={(i + 1) * 18}
              />
            </div>
          ))
        ) : (
          <div className="empty">
            No syllabus copy for this board/class. Add a chapter.
          </div>
        )}
      </Card>

      {edit && (
        <Modal
          wide
          title={
            edit.id
              ? 'Edit syllabus chapter'
              : 'Add syllabus chapter'
          }
          onClose={() =>
            setEdit(null)
          }
        >
          <div className="form-grid">
            <Field label="Board">
              <select
                value={edit.board}
                onChange={e =>
                  setEdit({
                    ...edit,
                    board: e.target.value
                  })
                }
              >
                {[
                  'SSC',
                  'CBSE',
                  'ICSE'
                ].map(x => (
                  <option>
                    {x}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Class">
              <select
                value={edit.classId}
                onChange={e =>
                  setEdit({
                    ...edit,
                    classId: e.target.value
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
                value={edit.subject}
                onChange={e =>
                  setEdit({
                    ...edit,
                    subject: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Chapter">
              <input
                value={edit.chapter}
                onChange={e =>
                  setEdit({
                    ...edit,
                    chapter: e.target.value
                  })
                }
              />
            </Field>
          </div>

          <h3 className="mt">
            Topics
          </h3>

          {edit.topics.map((t, i) => (
            <div
              className="topic-edit"
              key={t.id}
            >
              <input
                value={t.name}
                onChange={e => {
                  let a = [...edit.topics];

                  a[i] = {
                    ...t,
                    name: e.target.value
                  };

                  setEdit({
                    ...edit,
                    topics: a
                  });
                }}
              />

              <input
                value={t.sub}
                placeholder="Subtopic"
                onChange={e => {
                  let a = [...edit.topics];

                  a[i] = {
                    ...t,
                    sub: e.target.value
                  };

                  setEdit({
                    ...edit,
                    topics: a
                  });
                }}
              />

              <input
                type="number"
                min="1"
                value={t.periods}
                onChange={e => {
                  let a = [...edit.topics];

                  a[i] = {
                    ...t,
                    periods: +e.target.value
                  };

                  setEdit({
                    ...edit,
                    topics: a
                  });
                }}
              />

              <button
                className="btn sm"
                onClick={() =>
                  setEdit({
                    ...edit,
                    topics:
                      edit.topics.filter(
                        (_, x) => x !== i
                      )
                  })
                }
              >
                ×
              </button>
            </div>
          ))}

          <div className="actions top">
            <button
              className="btn"
              onClick={topic}
            >
              + Add topic
            </button>

            <button
              className="btn primary"
              onClick={() => {
                saveSyllabus(edit);
                setEdit(null);
              }}
            >
              Save syllabus
            </button>
          </div>
        </Modal>
      )}
    </Page>
  );
}