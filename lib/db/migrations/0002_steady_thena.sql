ALTER TABLE "invitations" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "invited_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "group_id" SET NOT NULL;