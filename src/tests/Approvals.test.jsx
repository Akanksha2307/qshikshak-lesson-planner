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


function createSubmittedPlan(result) {

  act(() => {
    result.current.generatePlan({
      classId: 'c8',
      section: 'A',
      subject: 'Mathematics',
      weekStart: '2026-09-28'
    });
  });

  const planId =
    result.current.data.plans.at(-1).id;

  act(() => {
    result.current.submitPlan(planId);
  });

  return planId;
}


describe('HOD Approvals - reviewPlan()', () => {

  beforeEach(() => {
    localStorage.clear();
  });


  test('HOD can approve submitted plan', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId =
      createSubmittedPlan(result);

    act(() => {
      result.current.reviewPlan(
        planId,
        'Approved',
        'Plan looks good'
      );
    });

    const plan =
      result.current.data.plans.find(
        item => item.id === planId
      );

    expect(
      plan.status
    ).toBe('Approved');
  });


  test('approval record changes to Approved', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId =
      createSubmittedPlan(result);

    act(() => {
      result.current.reviewPlan(
        planId,
        'Approved',
        'Plan looks good'
      );
    });

    const approval =
      result.current.data.approvals.find(
        item => item.planId === planId
      );

    expect(
      approval.status
    ).toBe('Approved');
  });


  test('stores HOD approval comment', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId =
      createSubmittedPlan(result);

    act(() => {
      result.current.reviewPlan(
        planId,
        'Approved',
        'Plan looks good'
      );
    });

    const approval =
      result.current.data.approvals.find(
        item => item.planId === planId
      );

    expect(
      approval.comment
    ).toBe('Plan looks good');
  });


  test('shows approval success message', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId =
      createSubmittedPlan(result);

    act(() => {
      result.current.reviewPlan(
        planId,
        'Approved',
        'Plan looks good'
      );
    });

    expect(
      result.current.toast
    ).toBe(
      'Plan approved successfully'
    );
  });


  test('HOD can send plan back', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId =
      createSubmittedPlan(result);

    act(() => {
      result.current.reviewPlan(
        planId,
        'Sent Back',
        'Please update objectives'
      );
    });

    const plan =
      result.current.data.plans.find(
        item => item.id === planId
      );

    expect(
      plan.status
    ).toBe('Sent Back');
  });


  test('approval record changes to Sent Back', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId =
      createSubmittedPlan(result);

    act(() => {
      result.current.reviewPlan(
        planId,
        'Sent Back',
        'Please update objectives'
      );
    });

    const approval =
      result.current.data.approvals.find(
        item => item.planId === planId
      );

    expect(
      approval.status
    ).toBe('Sent Back');
  });


  test('stores send back comment', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId =
      createSubmittedPlan(result);

    act(() => {
      result.current.reviewPlan(
        planId,
        'Sent Back',
        'Please update objectives'
      );
    });

    const approval =
      result.current.data.approvals.find(
        item => item.planId === planId
      );

    expect(
      approval.comment
    ).toBe(
      'Please update objectives'
    );
  });


  test('shows send back message', () => {

    const { result } = renderHook(
      () => usePlanner(),
      { wrapper }
    );

    const planId =
      createSubmittedPlan(result);

    act(() => {
      result.current.reviewPlan(
        planId,
        'Sent Back',
        'Please update objectives'
      );
    });

    expect(
      result.current.toast
    ).toBe('Plan sent back');
  });

});