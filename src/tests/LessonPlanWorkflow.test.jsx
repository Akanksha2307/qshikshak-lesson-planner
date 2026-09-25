// @vitest-environment jsdom

import React from 'react';
import { beforeEach, describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';

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

describe('Lesson Plan Complete Workflow', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================
  // CREATE LESSON
  // =========================================================

  describe('Create Lesson', () => {

    test('creates a new lesson plan', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

      const initialCount = result.current.data.plans.length;

      act(() => {
        result.current.generatePlan({
          classId: 'c8',
          section: 'A',
          subject: 'Mathematics',
          weekStart: '2026-09-28'
        });
      });

      expect(result.current.data.plans.length)
        .toBe(initialCount + 1);
    });


    test('created plan has Draft status', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

      act(() => {
        result.current.generatePlan({
          classId: 'c8',
          section: 'A',
          subject: 'Mathematics',
          weekStart: '2026-09-28'
        });
      });

      const plan = result.current.data.plans.at(-1);

      expect(plan.status).toBe('Draft');
    });


    test('creates plan with correct class, section and subject', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

      act(() => {
        result.current.generatePlan({
          classId: 'c8',
          section: 'A',
          subject: 'Mathematics',
          weekStart: '2026-09-28'
        });
      });

      const plan = result.current.data.plans.at(-1);

      expect(plan.classId).toBe('c8');
      expect(plan.section).toBe('A');
      expect(plan.subject).toBe('Mathematics');
    });


    test('generated lessons have Planned status', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

      const beforeCount = result.current.data.lessons.length;

      act(() => {
        result.current.generatePlan({
          classId: 'c8',
          section: 'A',
          subject: 'Mathematics',
          weekStart: '2026-09-28'
        });
      });

      const generatedLessons =
        result.current.data.lessons.slice(beforeCount);

      expect(generatedLessons.length).toBeGreaterThan(0);

      generatedLessons.forEach((lesson) => {
        expect(lesson.status).toBe('Planned');
      });
    });


    test('does not create duplicate lesson plan', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

      const planData = {
        classId: 'c8',
        section: 'A',
        subject: 'Mathematics',
        weekStart: '2026-09-28'
      };

      act(() => {
        result.current.generatePlan(planData);
      });

      const countAfterFirstPlan =
        result.current.data.plans.length;

      act(() => {
        result.current.generatePlan(planData);
      });

      expect(result.current.data.plans.length)
        .toBe(countAfterFirstPlan);
    });

  });


  // =========================================================
  // SUBMISSION
  // =========================================================

  describe('Lesson Plan Submission', () => {

    test('submits a Draft lesson plan to HOD', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

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

      const plan =
        result.current.data.plans.find(
          (p) => p.id === planId
        );

      expect(plan.status).toBe('Submitted');
    });


    test('creates approval record when lesson plan is submitted', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

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

      const approval =
        result.current.data.approvals.find(
          (a) => a.planId === planId
        );

      expect(approval).toBeDefined();
      expect(approval.status).toBe('Submitted');
      expect(approval.comment).toBe('');
    });


    test('does not create duplicate approval record', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

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

      const firstCount =
        result.current.data.approvals.length;

      act(() => {
        result.current.submitPlan(planId);
      });

      expect(result.current.data.approvals.length)
        .toBe(firstCount);
    });

  });


  // =========================================================
  // HOD APPROVAL
  // =========================================================

  describe('HOD Approval', () => {

    test('HOD approves submitted lesson plan', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

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

      act(() => {
        result.current.reviewPlan(
          planId,
          'Approved',
          'Plan looks good'
        );
      });

      const plan =
        result.current.data.plans.find(
          (p) => p.id === planId
        );

      expect(plan.status).toBe('Approved');
    });


    test('approval record changes to Approved', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

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

      act(() => {
        result.current.reviewPlan(
          planId,
          'Approved',
          'Plan looks good'
        );
      });

      const approval =
        result.current.data.approvals.find(
          (a) => a.planId === planId
        );

      expect(approval.status).toBe('Approved');

      expect(approval.comment)
        .toBe('Plan looks good');
    });

  });


  // =========================================================
  // HOD SEND BACK
  // =========================================================

  describe('HOD Send Back', () => {

    test('HOD can send submitted plan back to teacher', () => {
      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

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

      act(() => {
        result.current.reviewPlan(
          planId,
          'Sent Back',
          'Please update objectives'
        );
      });

      const plan =
        result.current.data.plans.find(
          (p) => p.id === planId
        );

      const approval =
        result.current.data.approvals.find(
          (a) => a.planId === planId
        );

      expect(plan.status)
        .toBe('Sent Back');

      expect(approval.status)
        .toBe('Sent Back');

      expect(approval.comment)
        .toBe('Please update objectives');
    });

  });


  // =========================================================
  // COMPLETE WORKFLOW
  // CREATE -> SUBMIT -> APPROVE
  // =========================================================

  test(
    'complete workflow: Create Lesson -> Submit -> Approve',
    () => {

      const { result } = renderHook(() => usePlanner(), {
        wrapper
      });

      // STEP 1
      // Teacher creates lesson plan

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

      let plan =
        result.current.data.plans.find(
          (p) => p.id === planId
        );

      expect(plan).toBeDefined();

      expect(plan.status)
        .toBe('Draft');


      // STEP 2
      // Teacher submits lesson plan

      act(() => {
        result.current.submitPlan(planId);
      });

      plan =
        result.current.data.plans.find(
          (p) => p.id === planId
        );

      expect(plan.status)
        .toBe('Submitted');

      let approval =
        result.current.data.approvals.find(
          (a) => a.planId === planId
        );

      expect(approval)
        .toBeDefined();

      expect(approval.status)
        .toBe('Submitted');


      // STEP 3
      // HOD approves lesson plan

      act(() => {
        result.current.reviewPlan(
          planId,
          'Approved',
          'Plan looks good'
        );
      });

      plan =
        result.current.data.plans.find(
          (p) => p.id === planId
        );

      approval =
        result.current.data.approvals.find(
          (a) => a.planId === planId
        );

      expect(plan.status)
        .toBe('Approved');

      expect(approval.status)
        .toBe('Approved');

      expect(approval.comment)
        .toBe('Plan looks good');
    }
  );

});