import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users with role-based access control
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("participant"), // "admin", "coordinator", "participant"
  firstName: text("first_name"),
  lastName: text("last_name"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Groups for collaborative work
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(), // Access code for participants
  coordinatorId: integer("coordinator_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group membership
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Delphi studies for RT evaluation
export const delphiStudies = pgTable("delphi_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  groupId: integer("group_id").references(() => groups.id),
  createdBy: integer("created_by").references(() => users.id),
  status: text("status").notNull().default("active"), // "active", "paused", "completed"
  round: integer("round").notNull().default(1),
  isAnonymous: boolean("is_anonymous").default(true),
  significanceThreshold: decimal("significance_threshold", { precision: 3, scale: 1 }).default("3.0"), // Threshold for requiring justification
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alternatives to be evaluated
export const alternatives = pgTable("alternatives", {
  id: serial("id").primaryKey(),
  studyId: integer("study_id").references(() => delphiStudies.id),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").default(true),
});

// Criteria for evaluation
export const criteria = pgTable("criteria", {
  id: serial("id").primaryKey(),
  studyId: integer("study_id").references(() => delphiStudies.id),
  name: text("name").notNull(),
  description: text("description"),
  weight: decimal("weight", { precision: 3, scale: 2 }).default("1.00"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").default(true),
});

// Individual user responses
export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  studyId: integer("study_id").references(() => delphiStudies.id),
  userId: integer("user_id").references(() => users.id),
  alternativeId: integer("alternative_id").references(() => alternatives.id),
  criteriaId: integer("criteria_id").references(() => criteria.id),
  score: decimal("score", { precision: 3, scale: 1 }).notNull(), // 0.0 to 10.0
  round: integer("round").notNull().default(1),
  confidence: integer("confidence").default(5), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Justifications for scores that differ significantly from group average
export const justifications = pgTable("justifications", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").references(() => responses.id),
  studyId: integer("study_id").references(() => delphiStudies.id),
  userId: integer("user_id").references(() => users.id),
  alternativeId: integer("alternative_id").references(() => alternatives.id),
  criteriaId: integer("criteria_id").references(() => criteria.id),
  justificationText: text("justification_text").notNull(),
  isVisible: boolean("is_visible").default(true), // Can be hidden by coordinators
  round: integer("round").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Aggregated scores (for performance)
export const aggregatedScores = pgTable("aggregated_scores", {
  id: serial("id").primaryKey(),
  studyId: integer("study_id").references(() => delphiStudies.id),
  alternativeId: integer("alternative_id").references(() => alternatives.id),
  criteriaId: integer("criteria_id").references(() => criteria.id),
  average: decimal("average", { precision: 4, scale: 2 }),
  median: decimal("median", { precision: 4, scale: 2 }),
  standardDeviation: decimal("standard_deviation", { precision: 4, scale: 2 }),
  responseCount: integer("response_count").default(0),
  round: integer("round").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many, one }) => ({
  coordinatedGroups: many(groups),
  groupMemberships: many(groupMembers),
  createdStudies: many(delphiStudies),
  responses: many(responses),
  justifications: many(justifications),
}));

export const groupRelations = relations(groups, ({ one, many }) => ({
  coordinator: one(users, {
    fields: [groups.coordinatorId],
    references: [users.id],
  }),
  members: many(groupMembers),
  studies: many(delphiStudies),
}));

export const groupMemberRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const delphiStudyRelations = relations(delphiStudies, ({ one, many }) => ({
  group: one(groups, {
    fields: [delphiStudies.groupId],
    references: [groups.id],
  }),
  creator: one(users, {
    fields: [delphiStudies.createdBy],
    references: [users.id],
  }),
  alternatives: many(alternatives),
  criteria: many(criteria),
  responses: many(responses),
  justifications: many(justifications),
  aggregatedScores: many(aggregatedScores),
}));

export const alternativeRelations = relations(alternatives, ({ one, many }) => ({
  study: one(delphiStudies, {
    fields: [alternatives.studyId],
    references: [delphiStudies.id],
  }),
  responses: many(responses),
  justifications: many(justifications),
  aggregatedScores: many(aggregatedScores),
}));

export const criteriaRelations = relations(criteria, ({ one, many }) => ({
  study: one(delphiStudies, {
    fields: [criteria.studyId],
    references: [delphiStudies.id],
  }),
  responses: many(responses),
  justifications: many(justifications),
  aggregatedScores: many(aggregatedScores),
}));

export const responseRelations = relations(responses, ({ one, many }) => ({
  study: one(delphiStudies, {
    fields: [responses.studyId],
    references: [delphiStudies.id],
  }),
  user: one(users, {
    fields: [responses.userId],
    references: [users.id],
  }),
  alternative: one(alternatives, {
    fields: [responses.alternativeId],
    references: [alternatives.id],
  }),
  criteria: one(criteria, {
    fields: [responses.criteriaId],
    references: [criteria.id],
  }),
  justifications: many(justifications),
}));

export const justificationRelations = relations(justifications, ({ one }) => ({
  response: one(responses, {
    fields: [justifications.responseId],
    references: [responses.id],
  }),
  study: one(delphiStudies, {
    fields: [justifications.studyId],
    references: [delphiStudies.id],
  }),
  user: one(users, {
    fields: [justifications.userId],
    references: [users.id],
  }),
  alternative: one(alternatives, {
    fields: [justifications.alternativeId],
    references: [alternatives.id],
  }),
  criteria: one(criteria, {
    fields: [justifications.criteriaId],
    references: [criteria.id],
  }),
}));

export const aggregatedScoreRelations = relations(aggregatedScores, ({ one }) => ({
  study: one(delphiStudies, {
    fields: [aggregatedScores.studyId],
    references: [delphiStudies.id],
  }),
  alternative: one(alternatives, {
    fields: [aggregatedScores.alternativeId],
    references: [alternatives.id],
  }),
  criteria: one(criteria, {
    fields: [aggregatedScores.criteriaId],
    references: [criteria.id],
  }),
}));

// Insert schemas for new tables
export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
});

export const insertDelphiStudySchema = createInsertSchema(delphiStudies).pick({
  title: true,
  description: true,
  groupId: true,
  createdBy: true,
  status: true,
  round: true,
  isAnonymous: true,
  significanceThreshold: true,
});

export const insertAlternativeSchema = createInsertSchema(alternatives).pick({
  studyId: true,
  name: true,
  description: true,
  order: true,
});

export const insertCriteriaSchema = createInsertSchema(criteria).pick({
  studyId: true,
  name: true,
  description: true,
  weight: true,
  order: true,
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  studyId: true,
  userId: true,
  alternativeId: true,
  criteriaId: true,
  score: true,
  round: true,
  confidence: true,
});

export const insertJustificationSchema = createInsertSchema(justifications).pick({
  responseId: true,
  studyId: true,
  userId: true,
  alternativeId: true,
  criteriaId: true,
  justificationText: true,
  round: true,
});

// Updated user schema with new fields
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const groupJoinSchema = z.object({
  code: z.string().length(6),
});

// Type exports
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertDelphiStudy = z.infer<typeof insertDelphiStudySchema>;
export type DelphiStudy = typeof delphiStudies.$inferSelect;
export type InsertAlternative = z.infer<typeof insertAlternativeSchema>;
export type Alternative = typeof alternatives.$inferSelect;
export type InsertCriteria = z.infer<typeof insertCriteriaSchema>;
export type Criteria = typeof criteria.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
export type InsertJustification = z.infer<typeof insertJustificationSchema>;
export type Justification = typeof justifications.$inferSelect;
export type AggregatedScore = typeof aggregatedScores.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type GroupJoinData = z.infer<typeof groupJoinSchema>;

// Legacy evaluation system (TOPP)
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  model: text("model").notNull(), // 'topp', 'nacional', 'subnacional'
  exerciseCode: text("exercise_code"), // Código del ejercicio para organizar evaluaciones
  groupCode: text("group_code"), // Código del grupo que realiza la evaluación
  country: text("country"), // País donde se realiza la evaluación
  territory: text("territory"), // Territorio específico de la evaluación
  responses: json("responses").notNull(), // JSON object with element responses
  justifications: json("justifications").notNull().default({}), // JSON object with element justifications
  scores: json("scores"), // Calculated scores by criteria/dimensions
  customStructure: json("custom_structure"), // Custom criteria/elements if modified
  customAlerts: json("custom_alerts").default([]), // Custom strategic alerts created by user
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bestPractices = pgTable("best_practices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  country: text("country").notNull(),
  institution: text("institution"),
  year: integer("year"),
  sourceUrl: text("source_url"),
  sourceType: text("source_type").notNull(), // "pdf", "web", "academic", "case_study"
  targetCriteria: json("target_criteria").$type<string[]>().notNull(), // Array of criteria names
  results: text("results"),
  keyLessons: json("key_lessons").$type<string[]>(),
  tags: json("tags").$type<string[]>(),
  isNew: boolean("is_new").default(true),
  incorporatedAt: timestamp("incorporated_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Scraping configuration table
export const scrapingConfigs = pgTable("scraping_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  baseUrl: text("base_url").notNull(),
  selectors: json("selectors").$type<{
    titleSelector: string;
    descriptionSelector: string;
    linkSelector?: string;
    categorySelector?: string;
    dateSelector?: string;
  }>().notNull(),
  isActive: boolean("is_active").default(true),
  lastScrapedAt: timestamp("last_scraped_at"),
  successCount: integer("success_count").default(0),
  errorCount: integer("error_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// External API configurations
export const externalApis = pgTable("external_apis", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  endpoint: text("endpoint").notNull(),
  apiType: text("api_type").notNull(), // "openai", "perplexity", "custom"
  authType: text("auth_type").notNull(), // "bearer", "api_key", "basic", "none"
  headers: json("headers").$type<Record<string, string>>(),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  successCount: integer("success_count").default(0),
  errorCount: integer("error_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scraping sessions for tracking
export const scrapingSessions = pgTable("scraping_sessions", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").references(() => scrapingConfigs.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("running"), // "running", "completed", "failed"
  practicesFound: integer("practices_found").default(0),
  practicesCreated: integer("practices_created").default(0),
  errorMessage: text("error_message"),
  logs: json("logs").$type<string[]>().default([]),
});

export const practiceRecommendations = pgTable("practice_recommendations", {
  id: serial("id").primaryKey(),
  practiceId: integer("practice_id").references(() => bestPractices.id),
  criterionName: text("criterion_name").notNull(),
  recommendation: text("recommendation").notNull(),
  implementationSteps: json("implementation_steps").$type<string[]>(),
  expectedImpact: text("expected_impact"),
  timeframe: text("timeframe"),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas for legacy and new systems
export const insertEvaluationSchema = createInsertSchema(evaluations).pick({
  title: true,
  model: true,
  exerciseCode: true,
  groupCode: true,
  country: true,
  territory: true,
  responses: true,
  justifications: true,
  scores: true,
  customStructure: true,
  customAlerts: true,
});

export const insertBestPracticeSchema = createInsertSchema(bestPractices).pick({
  title: true,
  description: true,
  country: true,
  institution: true,
  year: true,
  sourceUrl: true,
  sourceType: true,
  targetCriteria: true,
  results: true,
  keyLessons: true,
  tags: true,
});

export const insertScrapingConfigSchema = createInsertSchema(scrapingConfigs).pick({
  name: true,
  baseUrl: true,
  selectors: true,
});

export const insertExternalApiSchema = createInsertSchema(externalApis).pick({
  name: true,
  endpoint: true,
  apiType: true,
  authType: true,
  headers: true,
  rateLimitPerMinute: true,
});

export const insertPracticeRecommendationSchema = createInsertSchema(practiceRecommendations).pick({
  practiceId: true,
  criterionName: true,
  recommendation: true,
  implementationSteps: true,
  expectedImpact: true,
  timeframe: true,
});

// Legacy types 
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertBestPractice = z.infer<typeof insertBestPracticeSchema>;
export type BestPractice = typeof bestPractices.$inferSelect;
export type InsertPracticeRecommendation = z.infer<typeof insertPracticeRecommendationSchema>;
export type PracticeRecommendation = typeof practiceRecommendations.$inferSelect;
export type InsertScrapingConfig = z.infer<typeof insertScrapingConfigSchema>;
export type ScrapingConfig = typeof scrapingConfigs.$inferSelect;
export type InsertExternalApi = z.infer<typeof insertExternalApiSchema>;
export type ExternalApi = typeof externalApis.$inferSelect;
export type ScrapingSession = typeof scrapingSessions.$inferSelect;
