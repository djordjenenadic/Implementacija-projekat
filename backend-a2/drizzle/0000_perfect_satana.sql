CREATE TABLE "kupovinaKarte" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kupovinaKarte_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"idKarte" integer NOT NULL,
	"sifraKarte" varchar(20),
	"datumKupovine" timestamp NOT NULL,
	CONSTRAINT "kupovinaKarte_idKarte_unique" UNIQUE("idKarte")
);
--> statement-breakpoint
CREATE TABLE "stavkaKupovine" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stavkaKupovine_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"idKupovine" integer NOT NULL,
	"idUtakmice" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utakmicaRef" (
	"idUtakmice" integer PRIMARY KEY NOT NULL,
	"naziv" varchar(200) NOT NULL,
	"datumOdigravanja" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stavkaKupovine" ADD CONSTRAINT "stavkaKupovine_idKupovine_kupovinaKarte_id_fk" FOREIGN KEY ("idKupovine") REFERENCES "public"."kupovinaKarte"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stavkaKupovine" ADD CONSTRAINT "stavkaKupovine_idUtakmice_utakmicaRef_idUtakmice_fk" FOREIGN KEY ("idUtakmice") REFERENCES "public"."utakmicaRef"("idUtakmice") ON DELETE no action ON UPDATE no action;