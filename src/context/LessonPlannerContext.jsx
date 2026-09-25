import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { initialData } from "../data/initialData";

const C = createContext();

/*
 * IMPORTANT:
 * V5 forces the application to load the new initialData
 * instead of the old V4 data stored in localStorage.
 */
const KEY = "qshikshakLessonPlannerV7";

const uid = (prefix) =>
  prefix + Date.now() + Math.random().toString(16).slice(2, 6);

const clone = (value) => JSON.parse(JSON.stringify(value));

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function LessonPlannerProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);

      if (saved) {
        return JSON.parse(saved);
      }

      return clone(initialData);
    } catch (error) {
      console.error("Unable to load planner data:", error);
      return clone(initialData);
    }
  });

  const [toast, setToast] = useState("");

  /*
   * Save application state.
   */
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Unable to save planner data:", error);
    }
  }, [data]);

  /*
   * Automatically remove toast.
   */
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2400);

    return () => clearTimeout(timer);
  }, [toast]);

  /*
   * Generic array updater.
   */
  const patch = (key, fn, message) => {
    setData((current) => ({
      ...current,
      [key]: fn(current[key] || [], current),
    }));

    if (message) {
      setToast(message);
    }
  };

  /*
   * SETTINGS
   */
  const settings = (values) => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...values,
      },
    }));
  };

  /*
   * HOLIDAYS
   */
  const addHoliday = (holiday) => {
    patch(
      "holidays",
      (items) => [
        ...items,
        {
          ...holiday,
          id: holiday.id || uid("h"),
        },
      ],
      "Holiday added to calendar"
    );
  };

  const deleteHoliday = (id) => {
    patch(
      "holidays",
      (items) => items.filter((item) => item.id !== id),
      "Holiday deleted"
    );
  };

  /*
   * SYLLABUS
   */
  const saveSyllabus = (syllabus) => {
    patch(
      "syllabus",
      (items) => {
        if (syllabus.id) {
          return items.map((item) =>
            item.id === syllabus.id ? syllabus : item
          );
        }

        return [
          ...items,
          {
            ...syllabus,
            id: uid("s"),
          },
        ];
      },
      "Syllabus updated"
    );
  };

  const deleteSyllabus = (id) => {
    patch(
      "syllabus",
      (items) => items.filter((item) => item.id !== id),
      "Chapter deleted"
    );
  };

  /*
   * CLASSES
   */
  const saveClass = (classData) => {
    patch(
      "classes",
      (items) => {
        if (classData.id) {
          return items.map((item) =>
            item.id === classData.id ? classData : item
          );
        }

        return [
          ...items,
          {
            ...classData,
            id: uid("c"),
            sections: classData.sections || ["A"],
          },
        ];
      },
      "Class saved"
    );
  };

  const deleteClass = (id) => {
    patch(
      "classes",
      (items) => items.filter((item) => item.id !== id),
      "Class deleted"
    );
  };

  /*
   * EXAMINATIONS
   */
  const saveExam = (exam) => {
    patch(
      "exams",
      (items) => {
        if (exam.id) {
          return items.map((item) =>
            item.id === exam.id ? exam : item
          );
        }

        return [
          ...items,
          {
            ...exam,
            id: uid("e"),
          },
        ];
      },
      "Exam saved"
    );
  };

  const deleteExam = (id) => {
    patch(
      "exams",
      (items) => items.filter((item) => item.id !== id),
      "Exam deleted"
    );
  };

  /*
   * Check whether date is holiday.
   */
  const isHoliday = (date) => {
    return (data.holidays || []).some(
      (holiday) => holiday.date === date
    );
  };

  /*
   * Check whether date falls inside examination period.
   *
   * This supports:
   *
   * date
   * OR
   * startDate -> endDate
   */
  const isExamDate = (date) => {
    return (data.exams || []).some((exam) => {
      if (exam.date === date) {
        return true;
      }

      const start = exam.startDate || exam.date;
      const end = exam.endDate || exam.startDate || exam.date;

      if (!start || !end) {
        return false;
      }

      return date >= start && date <= end;
    });
  };

  /*
   * Holiday/exam blocker.
   */
  const blocked = (date) => {
    return isHoliday(date) || isExamDate(date);
  };

  /*
   * GET SYLLABUS FOR SELECTED SUBJECT
   *
   * This is important:
   *
   * class must match
   * subject must match
   * board must match
   */
  const getSubjectSyllabus = (classId, subject) => {
    return (data.syllabus || []).filter((item) => {
      return (
        item.classId === classId &&
        item.subject === subject &&
        item.board === data.settings.board
      );
    });
  };

  /*
   * GENERATE PLAN
   */
  const generatePlan = ({
    classId,
    section,
    subject,
    weekStart,
    nextWeek = false,
  }) => {
    if (!classId) {
      setToast("Please select a class");
      return;
    }

    if (!section) {
      setToast("Please select a section");
      return;
    }

    if (!subject) {
      setToast("Please select a subject");
      return;
    }

    if (!weekStart) {
      setToast("Please select week starting date");
      return;
    }

    /*
     * Start date.
     */
    const start = new Date(`${weekStart}T00:00:00`);

    if (Number.isNaN(start.getTime())) {
      setToast("Invalid week starting date");
      return;
    }

    /*
     * Build next week.
     */
    if (nextWeek) {
      start.setDate(start.getDate() + 7);
    }

    const actualWeekStart = formatDate(start);

    /*
     * Prevent duplicate plan ONLY for same:
     *
     * class
     * section
     * subject
     * week
     *
     * English + Mathematics can therefore both exist.
     */
    const duplicatePlan = (data.plans || []).some((plan) => {
      return (
        plan.classId === classId &&
        plan.section === section &&
        plan.subject === subject &&
        plan.weekStart === actualWeekStart
      );
    });

    if (duplicatePlan) {
      setToast(
        `${subject} plan already exists for this class, section and week`
      );
      return;
    }

    /*
     * IMPORTANT FIX:
     *
     * Old code had:
     *
     * (s.board === data.settings.board || true)
     *
     * which always returned true.
     *
     * Now SSC only reads SSC syllabus,
     * CBSE only reads CBSE,
     * ICSE only reads ICSE.
     */
    const syllabus = getSubjectSyllabus(classId, subject);

    if (!syllabus.length) {
      setToast(
        `No ${subject} syllabus found for ${data.settings.board}`
      );
      return;
    }

    /*
     * Convert syllabus chapters into lesson topics.
     *
     * periods: 2 means the topic can occupy two periods.
     */
    const topics = syllabus.flatMap((chapter) => {
      return (chapter.topics || []).flatMap((topic) => {
        const count = Math.max(
          1,
          Number(topic.periods) || 1
        );

        return Array.from({ length: count }, (_, index) => ({
          chapter: chapter.chapter,
          topic: topic.name,
          sub: topic.sub || "",
          topicId: topic.id,
          sequence: index + 1,
          totalPeriods: count,
        }));
      });
    });

    if (!topics.length) {
      setToast(`Add ${subject} syllabus topics first`);
      return;
    }

    /*
     * Create plan first.
     */
    const planId = uid("p");

    const plan = {
      id: planId,
      classId,
      section,
      subject,
      board: data.settings.board,
      year: data.settings.year,
      weekStart: actualWeekStart,
      status: "Draft",
      teacher: data.settings.userName,
      createdAt: new Date().toISOString(),
    };

    /*
     * Generate lessons from a realistic weekly subject timetable.
     *
     * A subject is NOT forced into P1/P2 every day. Each class/section/
     * subject gets a stable spread across all configured periods. This
     * keeps the demo frontend close to how a real school timetable works.
     */
    const slots = [];
    let topicIndex = 0;

    const periodsPerDay = Math.max(1, Number(data.settings.periodsPerDay) || 6);
    const times = {
      1: "08:30",
      2: "09:15",
      3: "10:00",
      4: "11:00",
      5: "11:45",
      6: "13:15",
      7: "14:00",
      8: "14:45",
    };

    // Five subject periods per week, distributed across Mon-Sat and P1-P6.
    // The seed changes the pattern for different class/section/subject choices.
    const patterns = [
      [[0,1],[1,4],[2,2],[3,5],[5,3]],
      [[0,3],[1,1],[2,5],[4,2],[5,6]],
      [[0,5],[1,2],[2,4],[3,1],[4,6]],
      [[0,2],[1,6],[3,3],[4,5],[5,1]],
      [[0,4],[2,1],[3,6],[4,3],[5,5]],
      [[1,3],[2,6],[3,2],[4,4],[5,1]],
    ];

    const seedText = `${classId}-${section}-${subject}`;
    const seed = [...seedText].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const pattern = patterns[seed % patterns.length];

    for (const [dayOffset, rawPeriod] of pattern) {
      if (topicIndex >= topics.length) break;

      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + dayOffset);
      const date = formatDate(currentDate);

      // Holidays and examination days never receive normal lessons.
      if (blocked(date)) continue;

      const period = ((rawPeriod - 1) % periodsPerDay) + 1;
      const topic = topics[topicIndex++];

      slots.push({
        id: uid("l"),
        planId,
        date,
        day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][currentDate.getDay()],
        period,
        time: times[period] || "",
        classId,
        section,
        subject,
        chapter: topic.chapter,
        topic: topic.topic,
        sub: topic.sub,
        teacher: data.settings.userName,
        status: "Planned",
        objectives: "",
        method: "Lecture",
        homework: "",
      });
    }

    if (!slots.length) {
      setToast(
        "No available teaching days. Check holidays and examinations."
      );
      return;
    }

    /*
     * Save plan + generated lessons together.
     */
    setData((current) => ({
      ...current,

      plans: [
        ...(current.plans || []),
        plan,
      ],

      lessons: [
        ...(current.lessons || []),
        ...slots,
      ],
    }));

    setToast(
      `${subject} ${
        nextWeek ? "next week" : "weekly"
      } plan generated successfully`
    );
  };

  /*
   * DELETE GENERATED PLAN
   *
   * Removes:
   * plan
   * lessons belonging to plan
   * HOD approvals belonging to plan
   */
  const deletePlan = (planId) => {
    setData((current) => ({
      ...current,

      plans: (current.plans || []).filter(
        (plan) => plan.id !== planId
      ),

      lessons: (current.lessons || []).filter(
        (lesson) => lesson.planId !== planId
      ),

      approvals: (current.approvals || []).filter(
        (approval) => approval.planId !== planId
      ),
    }));

    setToast("Lesson plan deleted");
  };

  /*
   * SAVE LESSON
   */
  const saveLesson = (lesson) => {
    patch(
      "lessons",
      (items) =>
        items.map((item) =>
          item.id === lesson.id
            ? {
                ...item,
                ...lesson,
              }
            : item
        ),
      "Lesson saved successfully"
    );
  };

  /*
   * COMPLETE LESSON
   */
  const completeLesson = (
    id,
    status,
    details = {}
  ) => {
    setData((current) => {
      const target = (current.lessons || []).find(
        (lesson) => lesson.id === id
      );

      if (!target) {
        return current;
      }

      const historyRecord = {
        ...target,
        ...details,

        status,

        id: uid("hist"),

        originalLessonId: id,

        recordedAt: new Date().toISOString(),
      };

      let lessons = (current.lessons || []).map(
        (lesson) =>
          lesson.id === id
            ? {
                ...lesson,
                ...details,
                status,
              }
            : lesson
      );

      /*
       * Carry unfinished topic forward.
       */
      if (
        status === "Partly Done" ||
        status === "Not Done"
      ) {
        const futureLessons = [...lessons]
          .filter(
            (lesson) =>
              lesson.planId === target.planId &&
              lesson.date >= target.date &&
              lesson.id !== id &&
              lesson.status === "Planned"
          )
          .sort((a, b) => {
            const first = `${a.date}-${a.period}`;
            const second = `${b.date}-${b.period}`;

            return first.localeCompare(second);
          });

        if (futureLessons[0]) {
          lessons = lessons.map((lesson) =>
            lesson.id === futureLessons[0].id
              ? {
                  ...lesson,
                  topic: target.topic,
                  chapter: target.chapter,
                  subject: target.subject,
                }
              : lesson
          );
        }
      }

      return {
        ...current,

        lessons,

        history: [
          historyRecord,
          ...(current.history || []),
        ],
      };
    });

    setToast("Lesson updated");
  };

  /*
   * RESCHEDULE
   */
  const reschedule = (
    id,
    date,
    period,
    reason
  ) => {
    if (blocked(date)) {
      setToast(
        "Cannot reschedule lesson on a holiday or examination date"
      );
      return;
    }

    setData((current) => {
      const oldLesson = (
        current.lessons || []
      ).find((lesson) => lesson.id === id);

      if (!oldLesson) {
        return current;
      }

      const historyRecord = {
        ...oldLesson,

        id: uid("hist"),

        originalLessonId: id,

        status: "Rescheduled",

        reason,

        recordedAt: new Date().toISOString(),
      };

      return {
        ...current,

        lessons: (current.lessons || []).map(
          (lesson) =>
            lesson.id === id
              ? {
                  ...lesson,
                  date,
                  period: Number(period),
                  status: "Rescheduled",
                }
              : lesson
        ),

        history: [
          historyRecord,
          ...(current.history || []),
        ],
      };
    });

    setToast("Lesson rescheduled");
  };

  /*
   * CANCEL LESSON
   */
  const cancelLesson = (id) => {
    setData((current) => {
      const oldLesson = (
        current.lessons || []
      ).find((lesson) => lesson.id === id);

      return {
        ...current,

        lessons: (current.lessons || []).map(
          (lesson) =>
            lesson.id === id
              ? {
                  ...lesson,
                  status: "Cancelled",
                }
              : lesson
        ),

        history: oldLesson
          ? [
              {
                ...oldLesson,

                id: uid("hist"),

                originalLessonId: id,

                status: "Cancelled",

                recordedAt:
                  new Date().toISOString(),
              },

              ...(current.history || []),
            ]
          : current.history || [],
      };
    });

    setToast("Lesson cancelled");
  };

  /*
   * SUBMIT PLAN TO HOD
   */
  const submitPlan = (id) => {
    setData((current) => {
      const alreadyExists = (
        current.approvals || []
      ).some(
        (approval) =>
          approval.planId === id
      );

      return {
        ...current,

        plans: (current.plans || []).map(
          (plan) =>
            plan.id === id
              ? {
                  ...plan,
                  status: "Submitted",
                }
              : plan
        ),

        approvals: alreadyExists
          ? (current.approvals || []).map(
              (approval) =>
                approval.planId === id
                  ? {
                      ...approval,
                      status: "Submitted",
                    }
                  : approval
            )
          : [
              ...(current.approvals || []),

              {
                id: uid("a"),
                planId: id,
                status: "Submitted",
                comment: "",
              },
            ],
      };
    });

    setToast("Plan submitted to HOD");
  };

  /*
   * HOD REVIEW
   */
  const reviewPlan = (
    id,
    status,
    comment
  ) => {
    setData((current) => ({
      ...current,

      plans: (current.plans || []).map(
        (plan) =>
          plan.id === id
            ? {
                ...plan,
                status,
              }
            : plan
      ),

      approvals: (
        current.approvals || []
      ).map((approval) =>
        approval.planId === id
          ? {
              ...approval,
              status,
              comment,
            }
          : approval
      ),
    }));

    setToast(
      status === "Approved"
        ? "Plan approved successfully"
        : "Plan sent back"
    );
  };

  /*
   * HOMEWORK
   */
  const saveHomework = (homework) => {
    patch(
      "homework",
      (items) => {
        if (homework.id) {
          return items.map((item) =>
            item.id === homework.id
              ? homework
              : item
          );
        }

        return [
          ...items,

          {
            ...homework,
            id: uid("hw"),
          },
        ];
      },
      "Homework saved"
    );
  };

  const delHomework = (id) => {
    patch(
      "homework",
      (items) =>
        items.filter((item) => item.id !== id),
      "Homework deleted"
    );
  };

  /*
   * RESET DEMO DATA
   */
  const reset = () => {
    const freshData = clone(initialData);

    setData(freshData);

    localStorage.setItem(
      KEY,
      JSON.stringify(freshData)
    );

    setToast("Demo data reset");
  };

  /*
   * Expose context.
   */
  const value = useMemo(
    () => ({
      data,

      settings,

      toast,

      setToast,

      addHoliday,
      deleteHoliday,

      saveSyllabus,
      deleteSyllabus,

      saveClass,
      deleteClass,

      saveExam,
      deleteExam,

      generatePlan,
      deletePlan,

      saveLesson,
      completeLesson,

      reschedule,
      cancelLesson,

      submitPlan,
      reviewPlan,

      saveHomework,
      delHomework,

      reset,

      blocked,
    }),
    [data, toast]
  );

  return (
    <C.Provider value={value}>
      {children}
    </C.Provider>
  );
}

export const usePlanner = () => {
  return useContext(C);
};