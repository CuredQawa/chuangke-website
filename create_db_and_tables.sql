CREATE DATABASE chuangke;

CREATE TABLE announcements (
	id serial4 NOT NULL,
	title text NOT NULL,
	"content" text NOT NULL,
	"datetime" timestamp NOT NULL,
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
	"password" text NOT NULL, -- bcrypt 加密
	graduation_year int4 NOT NULL, -- 毕业届
	email varchar NOT NULL,
	"role" varchar NOT NULL, -- 角色（用于权限控制）
	CONSTRAINT accounts_pk PRIMARY KEY (id)
);

CREATE TABLE images (
	id serial4 NOT NULL,
	filename varchar NOT NULL,
	description varchar NOT NULL,
	author_id int4 NOT NULL,
	CONSTRAINT files_pk PRIMARY KEY (id),
	CONSTRAINT files_unique UNIQUE (filename)
);
