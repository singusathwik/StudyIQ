import { z } from 'zod';

const flashcardItemSchema = z.object({
  id: z.string().optional().default(() => `fc-${Math.random().toString(36).substr(2, 9)}`),
  front: z.string().min(1, "Flashcard front text cannot be empty"),
  back: z.string().min(1, "Flashcard back text cannot be empty")
});

const flashcardDeckBlockSchema = z.object({
  type: z.literal('flashcard_deck'),
  title: z.string().default('Flashcards'),
  items: z.array(flashcardItemSchema).min(1, "Flashcard deck must contain at least 1 card")
});

const mcqItemSchema = z.object({
  id: z.string().optional().default(() => `mcq-${Math.random().toString(36).substr(2, 9)}`),
  question: z.string().min(1, "MCQ question cannot be empty"),
  options: z.array(z.string()).min(2, "MCQ must have at least 2 options"),
  answer: z.string().min(1, "MCQ answer cannot be empty"),
  explanation: z.string().default("No explanation provided.")
});

const mcqBlockSchema = z.object({
  type: z.literal('mcq'),
  title: z.string().default('Multiple Choice Quiz'),
  items: z.array(mcqItemSchema).min(1, "MCQ block must contain at least 1 question")
});

const trueFalseItemSchema = z.object({
  id: z.string().optional().default(() => `tf-${Math.random().toString(36).substr(2, 9)}`),
  question: z.string().min(1, "True/False question cannot be empty"),
  answer: z.boolean(),
  explanation: z.string().default("No explanation provided.")
});

const trueFalseBlockSchema = z.object({
  type: z.literal('true_false'),
  title: z.string().default('True or False Quiz'),
  items: z.array(trueFalseItemSchema).min(1, "True/False block must contain at least 1 question")
});

const fillBlankItemSchema = z.object({
  id: z.string().optional().default(() => `fb-${Math.random().toString(36).substr(2, 9)}`),
  question: z.string().min(1, "Fill-in-the-blank question cannot be empty"),
  answer: z.string().min(1, "Fill-in-the-blank answer cannot be empty"),
  explanation: z.string().default("No explanation provided.")
});

const fillBlankBlockSchema = z.object({
  type: z.literal('fill_blank'),
  title: z.string().default('Fill in the Blank Quiz'),
  items: z.array(fillBlankItemSchema).min(1, "Fill-in-the-blank block must contain at least 1 question")
});

const blockSchema = z.discriminatedUnion('type', [
  flashcardDeckBlockSchema,
  mcqBlockSchema,
  trueFalseBlockSchema,
  fillBlankBlockSchema
]);

export const studyResponseSchema = z.object({
  topic: z.string().min(1, "Topic must not be empty"),
  concepts: z.array(z.string()).default([]),
  blocks: z.array(blockSchema).min(1, "Response must contain at least one study block")
});
