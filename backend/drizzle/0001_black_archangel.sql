CREATE TABLE "grupa" (
	"idGrupa" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "grupa_idGrupa_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"naziv" varchar(50) NOT NULL,
	"idPrvenstva" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "karta" (
	"idKarta" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "karta_idKarta_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sifra" varchar(20) NOT NULL,
	"ime" varchar(100) NOT NULL,
	"prezime" varchar(100) NOT NULL,
	"adresa1" varchar(200) NOT NULL,
	"postanskiBroj" varchar(20) NOT NULL,
	"mesto" varchar(100) NOT NULL,
	"drzava" varchar(100) NOT NULL,
	"email" varchar(200) NOT NULL,
	"emailPotvrdjen" boolean DEFAULT false NOT NULL,
	"status" varchar(30) DEFAULT 'na_cekanju' NOT NULL,
	"ukupnaCena" numeric(10, 2) NOT NULL,
	"kursNaDanKupovine" numeric(10, 4) NOT NULL,
	"idValute" integer NOT NULL,
	"datumKreiranja" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "karta_sifra_unique" UNIQUE("sifra")
);
--> statement-breakpoint
CREATE TABLE "koriscenjePromoKoda" (
	"idPromoKoda" integer PRIMARY KEY NOT NULL,
	"kartaIskoristilaId" integer NOT NULL,
	CONSTRAINT "koriscenjePromoKoda_kartaIskoristilaId_unique" UNIQUE("kartaIskoristilaId")
);
--> statement-breakpoint
CREATE TABLE "promoKod" (
	"idPromoKod" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "promoKod_idPromoKod_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kod" varchar(20) NOT NULL,
	"iskoriscen" boolean DEFAULT false NOT NULL,
	"kartaGenerisalaId" integer NOT NULL,
	CONSTRAINT "promoKod_kod_unique" UNIQUE("kod"),
	CONSTRAINT "promoKod_kartaGenerisalaId_unique" UNIQUE("kartaGenerisalaId")
);
--> statement-breakpoint
CREATE TABLE "stadion" (
	"idStadion" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stadion_idStadion_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"naziv" varchar(150) NOT NULL,
	"lokacija" varchar(150) NOT NULL,
	"kapacitet" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stavkaKarte" (
	"idKarte" integer NOT NULL,
	"idUtakmice" integer NOT NULL,
	"cena" numeric(10, 2) NOT NULL,
	"popustPrimenjen" boolean DEFAULT false NOT NULL,
	CONSTRAINT "stavkaKarte_idKarte_idUtakmice_pk" PRIMARY KEY("idKarte","idUtakmice")
);
--> statement-breakpoint
CREATE TABLE "tim" (
	"idTim" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tim_idTim_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"naziv" varchar(100) NOT NULL,
	"idGrupe" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utakmica" (
	"idUtakmica" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "utakmica_idUtakmica_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"datum" date NOT NULL,
	"vreme" time NOT NULL,
	"cenaKarte" numeric(10, 2) NOT NULL,
	"idStadiona" integer NOT NULL,
	"tim1Id" integer NOT NULL,
	"tim2Id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuta" (
	"idValute" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "valuta_idValute_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"naziv" varchar(50) NOT NULL,
	"kod" varchar(3) NOT NULL,
	"aktivna" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grupa" ADD CONSTRAINT "grupa_idPrvenstva_prvenstvo_id_fk" FOREIGN KEY ("idPrvenstva") REFERENCES "public"."prvenstvo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "karta" ADD CONSTRAINT "karta_idValute_valuta_idValute_fk" FOREIGN KEY ("idValute") REFERENCES "public"."valuta"("idValute") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "koriscenjePromoKoda" ADD CONSTRAINT "koriscenjePromoKoda_idPromoKoda_promoKod_idPromoKod_fk" FOREIGN KEY ("idPromoKoda") REFERENCES "public"."promoKod"("idPromoKod") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "koriscenjePromoKoda" ADD CONSTRAINT "koriscenjePromoKoda_kartaIskoristilaId_karta_idKarta_fk" FOREIGN KEY ("kartaIskoristilaId") REFERENCES "public"."karta"("idKarta") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promoKod" ADD CONSTRAINT "promoKod_kartaGenerisalaId_karta_idKarta_fk" FOREIGN KEY ("kartaGenerisalaId") REFERENCES "public"."karta"("idKarta") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stavkaKarte" ADD CONSTRAINT "stavkaKarte_idKarte_karta_idKarta_fk" FOREIGN KEY ("idKarte") REFERENCES "public"."karta"("idKarta") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stavkaKarte" ADD CONSTRAINT "stavkaKarte_idUtakmice_utakmica_idUtakmica_fk" FOREIGN KEY ("idUtakmice") REFERENCES "public"."utakmica"("idUtakmica") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim" ADD CONSTRAINT "tim_idGrupe_grupa_idGrupa_fk" FOREIGN KEY ("idGrupe") REFERENCES "public"."grupa"("idGrupa") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utakmica" ADD CONSTRAINT "utakmica_idStadiona_stadion_idStadion_fk" FOREIGN KEY ("idStadiona") REFERENCES "public"."stadion"("idStadion") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utakmica" ADD CONSTRAINT "utakmica_tim1Id_tim_idTim_fk" FOREIGN KEY ("tim1Id") REFERENCES "public"."tim"("idTim") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utakmica" ADD CONSTRAINT "utakmica_tim2Id_tim_idTim_fk" FOREIGN KEY ("tim2Id") REFERENCES "public"."tim"("idTim") ON DELETE no action ON UPDATE no action;