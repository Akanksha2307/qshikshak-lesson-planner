import React from 'react';

import { X } from 'lucide-react';

import './UI.css';

export const Card = ({
  children,
  className = ''
}) => (
  <div className={'card ' + className}>
    {children}
  </div>
);

export const Badge = ({ children }) => (
  <span
    className={
      'badge ' +
      String(children)
        .toLowerCase()
        .replaceAll(' ', '-')
    }
  >
    {children}
  </span>
);

export const Progress = ({ value }) => (
  <div className="progress">
    <i
      style={{
        width: `${
          Math.max(
            0,
            Math.min(
              100,
              value || 0
            )
          )
        }%`
      }}
    />
  </div>
);

export const Modal = ({
  title,
  onClose,
  children,
  wide = false
}) => (
  <div className="modal-back">
    <div
      className={
        'modal ' +
        (wide ? 'wide' : '')
      }
    >
      <div className="modal-head">
        <h3>
          {title}
        </h3>

        <button
          className="icon"
          onClick={onClose}
        >
          <X />
        </button>
      </div>

      {children}
    </div>
  </div>
);

export const Page = ({
  eyebrow,
  title,
  sub,
  actions,
  children
}) => (
  <>
    <div className="page-head">
      <div>
        <small>
          {eyebrow}
        </small>

        <h1>
          {title}
        </h1>

        <p>
          {sub}
        </p>
      </div>

      <div className="actions">
        {actions}
      </div>
    </div>

    {children}
  </>
);

export const Field = ({
  label,
  children
}) => (
  <label className="field">
    <span>
      {label}
    </span>

    {children}
  </label>
);