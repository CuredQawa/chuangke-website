CREATE DATABASE chuangke;

CREATE TABLE announcements (
	id serial4 NOT NULL,
	title text NOT NULL,
	"content" text NOT NULL,
	"datetime" timestamp NOT NULL,
	updated_at timestamp,
	author_id int4 NOT NULL,
	CONSTRAINT announcements_pk PRIMARY KEY (id)
);

CREATE TABLE docs (
	id serial4 NOT NULL,
	title text NOT NULL,
	"content" text NOT NULL,
	datetime timestamp NOT NULL,
	author_id int4 NOT NULL,
	category varchar(50) DEFAULT 'doc'::character varying NOT NULL,
	cover_image_url varchar NULL,
	CONSTRAINT docs_pk PRIMARY KEY (id)
);

CREATE TABLE accounts (
	id serial4 NOT NULL,
	username varchar NOT NULL,
	"password" text NOT NULL,
	graduation_year int4 NOT NULL,
	email varchar NOT NULL,
	"role" varchar NOT NULL,
	CONSTRAINT accounts_pk PRIMARY KEY (id),
	CONSTRAINT accounts_email_unique UNIQUE (email),
	CONSTRAINT accounts_username_unique UNIQUE (username)
);

CREATE TABLE images (
	id serial4 NOT NULL,
	filename varchar NOT NULL,
	description varchar NOT NULL,
	author_id int4 NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT files_pk PRIMARY KEY (id),
	CONSTRAINT files_unique UNIQUE (filename)
);

CREATE INDEX IF NOT EXISTS images_created_at_idx ON images (created_at DESC);
