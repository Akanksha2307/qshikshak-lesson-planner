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


function createPlan(result) {

  act(() => {
    result.current.generatePlan({
      classId: 'c8',
      section: 'A',
      subject: 'Mathematics',
      weekStart: '2026-09-28'
    });
  });

  return result.current.data.plans.at(-1).id;
}


describe('Lesson Submission - submitPlan()', () => {

  beforeEach(() => {
    localStorage.clear();
  });


  test('changes plan status to Submitted', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId = createPlan(result);

    act(() => {
      result.current.submitPlan(planId);
    });

    const plan =
      result.current.data.plans.find(
        item => item.id === planId
      );

    expect(plan.status).toBe('Submitted');
  });


  test('creates approval record after submission', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId = createPlan(result);

    act(() => {
      result.current.submitPlan(planId);
    });

    const approval =
      result.current.data.approvals.find(
        item => item.planId === planId
      );

    expect(approval).toBeDefined();
  });


  test('approval status is Submitted', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId = createPlan(result);

    act(() => {
      result.current.submitPlan(planId);
    });

    const approval =
      result.current.data.approvals.find(
        item => item.planId === planId
      );

    expect(
      approval.status
    ).toBe('Submitted');
  });


  test('approval contains correct plan ID', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId = createPlan(result);

    act(() => {
      result.current.submitPlan(planId);
    });

    const approval =
      result.current.data.approvals.find(
        item => item.planId === planId
      );

    expect(
      approval.planId
    ).toBe(planId);
  });


  test('new approval has empty comment', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId = createPlan(result);

    act(() => {
      result.current.submitPlan(planId);
    });

    const approval =
      result.current.data.approvals.find(
        item => item.planId === planId
      );

    expect(
      approval.comment
    ).toBe('');
  });


  test('shows submission success message', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId = createPlan(result);

    act(() => {
      result.current.submitPlan(planId);
    });

    expect(
      result.current.toast
    ).toBe('Plan submitted to HOD');
  });


  test('does not create duplicate approval record', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId = createPlan(result);

    act(() => {
      result.current.submitPlan(planId);
    });

    act(() => {
      result.current.submitPlan(planId);
    });

    const approvals =
      result.current.data.approvals.filter(
        item => item.planId === planId
      );

    expect(approvals).toHaveLength(1);
  });

});