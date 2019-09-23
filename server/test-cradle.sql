BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "referral" (
	"id"	INTEGER NOT NULL,
	"date_referred"	DATETIME NOT NULL,
	"user_id"	INTEGER,
	"patient_id"	VARCHAR(50),
	"referral_health_facility_id"	INTEGER,
	"reading_id"	INTEGER,
	"follow_up_id"	INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY("user_id") REFERENCES "user"("id"),
	FOREIGN KEY("patient_id") REFERENCES "patient"("id"),
	FOREIGN KEY("follow_up_id") REFERENCES "follow_up"("id"),
	FOREIGN KEY("referral_health_facility_id") REFERENCES "health_facility"("id"),
	FOREIGN KEY("reading_id") REFERENCES "reading"("id")
);
CREATE TABLE IF NOT EXISTS "reading" (
	"id"	INTEGER NOT NULL,
	"bp_systolic"	INTEGER,
	"bp_diastolic"	INTEGER,
	"heart_rate_bpm"	INTEGER,
	"date_time_taken"	DATETIME,
	"date_uploaded_to_server"	DATETIME,
	"gps_location_of_reading"	VARCHAR(50),
	"patient_id"	INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("patient_id") REFERENCES "patient"("id")
);
CREATE TABLE IF NOT EXISTS "user_role" (
	"id"	INTEGER NOT NULL,
	"user_id"	INTEGER,
	"role_id"	INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY("role_id") REFERENCES "role"("id"),
	FOREIGN KEY("user_id") REFERENCES "user"("id")
);
CREATE TABLE IF NOT EXISTS "patient" (
	"id"	INTEGER NOT NULL,
	"age"	INTEGER NOT NULL,
	"sex"	VARCHAR(6) NOT NULL,
	"pregnant"	BOOLEAN,
	"gestationalAge"	VARCHAR(20),
	"medical_history"	TEXT,
	"drug_history"	TEXT,
	"symptoms"	TEXT,
	"village_no"	INTEGER,
	FOREIGN KEY("village_no") REFERENCES "village"("village_no"),
	PRIMARY KEY("id"),
	CONSTRAINT "sexenum" CHECK(sex IN ('MALE','FEMALE','OTHER')),
	CHECK(pregnant IN (0,1))
);
CREATE TABLE IF NOT EXISTS "user" (
	"id"	INTEGER NOT NULL,
	"username"	VARCHAR(64),
	"email"	VARCHAR(120),
	"password_hash"	VARCHAR(128),
	"health_facility_id"	INTEGER,
	FOREIGN KEY("health_facility_id") REFERENCES "health_facility"("id"),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "village" (
	"village_no"	VARCHAR(50) NOT NULL,
	PRIMARY KEY("village_no")
);
CREATE TABLE IF NOT EXISTS "follow_up" (
	"id"	INTEGER NOT NULL,
	"follow_up_action"	TEXT,
	"diagnosis"	TEXT,
	"treatment"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "health_facility" (
	"id"	INTEGER NOT NULL,
	"address"	VARCHAR(150),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "role" (
	"id"	INTEGER NOT NULL,
	"name"	VARCHAR(5) NOT NULL,
	PRIMARY KEY("id"),
	CONSTRAINT "roleenum" CHECK(name IN ('VHT','HCW','ADMIN'))
);
INSERT INTO "referral" VALUES (1,'2019-10-01 10:10:10',1,'1',NULL,1,1);
INSERT INTO "reading" VALUES (1,145,80,80,'2019-10-01 10:10:10',NULL,NULL,1);
INSERT INTO "user_role" VALUES (1,1,1);
INSERT INTO "user_role" VALUES (2,2,3);
INSERT INTO "patient" VALUES (1,28,'FEMALE',1,'15',NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES (1,'foo','a@a.com','21321',NULL);
INSERT INTO "user" VALUES (2,'bar','b@b.com','321321',NULL);
INSERT INTO "user" VALUES (3,'hcw','c@c.com','32131',1);
INSERT INTO "follow_up" VALUES (1,'HELP HER','ALMOST HEALTHY','MEDS');
INSERT INTO "health_facility" VALUES (1,'nowhere');
INSERT INTO "role" VALUES (1,'VHT');
INSERT INTO "role" VALUES (2,'HCW');
INSERT INTO "role" VALUES (3,'ADMIN');
CREATE UNIQUE INDEX IF NOT EXISTS "ix_user_email" ON "user" (
	"email"
);
CREATE UNIQUE INDEX IF NOT EXISTS "ix_user_username" ON "user" (
	"username"
);
COMMIT;
