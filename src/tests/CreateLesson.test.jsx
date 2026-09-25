// @vitest-environment jsdom

import React from 'react';

import {
  beforeEach,
  describe,
  expect,
  test
} from 'vitest';

import {
  act,
  renderHook
} from '@testing-library/react';

import {
  LessonPlannerProvider,
  usePlanner
} from '../context/LessonPlannerContext';


function wrapper({ children }) {
  return (
    <LessonPlannerProvider>
      {children}
    </LessonPlannerProvider>
  );
}


describe('Create Lesson - generatePlan()', () => {

  beforeEach(() => {
    localStorage.clear();
  });


  test('creates a new lesson plan', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const initialCount =
      result.current.data.plans.length;

    act(() => {
      result.current.generatePlan({
        classId: 'c8',
        section: 'A',
        subject: 'Mathematics',
        weekStart: '2026-09-28'
      });
    });

    expect(
      result.current.data.plans.length
    ).toBe(initialCount + 1);
  });


  test('created plan has Draft status', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    act(() => {
      result.current.generatePlan({
        classId: 'c8',
        section: 'A',
        subject: 'Mathematics',
        weekStart: '2026-09-28'
      });
    });

    const plan =
      result.current.data.plans.at(-1);

    expect(plan.status).toBe('Draft');
  });


  test('created plan contains correct class', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    act(() => {
      result.current.generatePlan({
        classId: 'c8',
        section: 'A',
        subject: 'Mathematics',
        weekStart: '2026-09-28'
      });
    });

    const plan =
      result.current.data.plans.at(-1);

    expect(plan.classId).toBe('c8');
  });


  test('created plan contains correct section', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    act(() => {
      result.current.generatePlan({
        classId: 'c8',
        section: 'A',
        subject: 'Mathematics',
        weekStart: '2026-09-28'
      });
    });

    const plan =
      result.current.data.plans.at(-1);

    expect(plan.section).toBe('A');
  });


  test('created plan contains correct subject', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    act(() => {
      result.current.generatePlan({
        classId: 'c8',
        section: 'A',
        subject: 'Mathematics',
        weekStart: '2026-09-28'
      });
    });

    const plan =
      result.current.data.plans.at(-1);

    expect(plan.subject).toBe('Mathematics');
  });


  test('generated lessons have Planned status', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    act(() => {
      result.current.generatePlan({
        classId: 'c8',
        section: 'A',
        subject: 'Mathematics',
        weekStart: '2026-09-28'
      });
    });

    const plan =
      result.current.data.plans.at(-1);

    const lessons =
      result.current.data.lessons.filter(
        lesson => lesson.planId === plan.id
      );

    expect(
      lessons.length
    ).toBeGreaterThan(0);

    lessons.forEach(lesson => {
      expect(lesson.status).toBe('Planned');
    });
  });


  test('does not create duplicate plan', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const input = {
      classId: 'c8',
      section: 'A',
      subject: 'Mathematics',
      weekStart: '2026-09-28'
    };

    act(() => {
      result.current.generatePlan(input);
    });

    const count =
      result.current.data.plans.length;

    act(() => {
      result.current.generatePlan(input);
    });

    expect(
      result.current.data.plans.length
    ).toBe(count);
  });

});