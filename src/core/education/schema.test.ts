import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createEducationCourseSchema,
  createEducationNoteSchema,
  createEducationQuizSchema,
  updateEducationQuizSchema,
} from "./schema";

test("education course requires a title and topic", () => {
  assert.equal(createEducationCourseSchema.safeParse({ title: "Biology", topic: "" }).success, false);
  assert.equal(
    createEducationCourseSchema.safeParse({ title: "Biology", topic: "Cells" }).success,
    true,
  );
});

test("education note requires a title", () => {
  assert.equal(createEducationNoteSchema.safeParse({ title: "", body: "Hi" }).success, false);
  assert.equal(createEducationNoteSchema.safeParse({ title: "Mitosis", body: "Hi" }).success, true);
});

test("education quiz requires a course, question, and answer", () => {
  assert.equal(
    createEducationQuizSchema.safeParse({ courseId: "c1", question: "What?", answer: "" }).success,
    false,
  );
  assert.equal(
    createEducationQuizSchema.safeParse({
      courseId: "c1",
      question: "What is a cell?",
      answer: "The basic unit of life",
    }).success,
    true,
  );
});

test("education quiz update accepts a user answer", () => {
  assert.equal(updateEducationQuizSchema.safeParse({}).success, false);
  assert.equal(updateEducationQuizSchema.safeParse({ userAnswer: "The basic unit of life" }).success, true);
});
