DROP TABLE `refresh_tokens`;--> statement-breakpoint
DROP TABLE `device_tokens`;--> statement-breakpoint
ALTER TABLE `users` ADD `refresh_token_hash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `device_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `device_platform` text;