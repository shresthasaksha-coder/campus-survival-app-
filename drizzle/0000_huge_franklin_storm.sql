CREATE TABLE `checklist` (
	`user_id` text NOT NULL,
	`step` text NOT NULL,
	`complete` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`user_id`, `step`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`student_type` text DEFAULT 'incoming' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`author` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`category` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `questions_user_time` ON `questions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `replies` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`user_id` text NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `replies_question` ON `replies` (`question_id`);--> statement-breakpoint
CREATE INDEX `replies_user_time` ON `replies` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reports_user_time` ON `reports` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `saves` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`)
);
