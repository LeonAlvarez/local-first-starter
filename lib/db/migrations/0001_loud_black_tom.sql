ALTER TABLE "invitations" ALTER COLUMN "role" SET DATA TYPE role;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "role" SET DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "status" SET DATA TYPE invitationStatus;