CREATE TABLE "prvenstvo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prvenstvo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"naziv" varchar(200) NOT NULL,
	"lokacija" varchar(200) NOT NULL,
	"datumPocetka" date NOT NULL,
	"datumZavrsetka" date NOT NULL,
	"opis" text,
	"datumPopustaDo" date
);
