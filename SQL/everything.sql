--
-- PostgreSQL database dump
--

\restrict CgcFEFLZ7aIuE5fSiSP5AdKJnDXCht1e6vByClfB8V3OWyNEaN5kIgWH0Rr1Yfr

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS "session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.account DROP CONSTRAINT IF EXISTS "account_userId_fkey";
DROP INDEX IF EXISTS public.verification_identifier_value_key;
DROP INDEX IF EXISTS public.verification_identifier_idx;
DROP INDEX IF EXISTS public.user_email_key;
DROP INDEX IF EXISTS public."session_userId_idx";
DROP INDEX IF EXISTS public.session_token_key;
DROP INDEX IF EXISTS public."account_userId_idx";
DROP INDEX IF EXISTS public."account_providerId_accountId_key";
ALTER TABLE IF EXISTS ONLY public.verification DROP CONSTRAINT IF EXISTS verification_pkey;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_pkey;
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS session_pkey;
ALTER TABLE IF EXISTS ONLY public.account DROP CONSTRAINT IF EXISTS account_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.verification;
DROP TABLE IF EXISTS public."user";
DROP TABLE IF EXISTS public.session;
DROP TABLE IF EXISTS public.account;
DROP TABLE IF EXISTS public._prisma_migrations;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: jobly
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO jobly;

--
-- Name: account; Type: TABLE; Schema: public; Owner: jobly
--

CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    scope text,
    password text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO jobly;

--
-- Name: session; Type: TABLE; Schema: public; Owner: jobly
--

CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL
);


ALTER TABLE public.session OWNER TO jobly;

--
-- Name: user; Type: TABLE; Schema: public; Owner: jobly
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."user" OWNER TO jobly;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: jobly
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification OWNER TO jobly;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: jobly
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
cafc4991-be4c-4b4f-80f2-ceb3d7df8793	c48702e048bf71a9b89eef59ef3006d5345b32665bcbb6f76d1fc07d47d91959	2026-02-07 13:25:29.399302+00	20260207054445_add_auth	\N	\N	2026-02-07 13:25:29.394017+00	1
f827ccbc-367a-4c1e-af29-3c4e5e28e943	c19cc67eb2cec950e799337382fcbb6c74ed94e65b472330d2483f0629913214	2026-02-07 13:25:29.408901+00	20260207055625_auth	\N	\N	2026-02-07 13:25:29.399759+00	1
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: jobly
--

COPY public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: jobly
--

COPY public.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: jobly
--

COPY public."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: jobly
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: jobly
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: jobly
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: jobly
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: jobly
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: jobly
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: account_providerId_accountId_key; Type: INDEX; Schema: public; Owner: jobly
--

CREATE UNIQUE INDEX "account_providerId_accountId_key" ON public.account USING btree ("providerId", "accountId");


--
-- Name: account_userId_idx; Type: INDEX; Schema: public; Owner: jobly
--

CREATE INDEX "account_userId_idx" ON public.account USING btree ("userId");


--
-- Name: session_token_key; Type: INDEX; Schema: public; Owner: jobly
--

CREATE UNIQUE INDEX session_token_key ON public.session USING btree (token);


--
-- Name: session_userId_idx; Type: INDEX; Schema: public; Owner: jobly
--

CREATE INDEX "session_userId_idx" ON public.session USING btree ("userId");


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: jobly
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: public; Owner: jobly
--

CREATE INDEX verification_identifier_idx ON public.verification USING btree (identifier);


--
-- Name: verification_identifier_value_key; Type: INDEX; Schema: public; Owner: jobly
--

CREATE UNIQUE INDEX verification_identifier_value_key ON public.verification USING btree (identifier, value);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jobly
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jobly
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict CgcFEFLZ7aIuE5fSiSP5AdKJnDXCht1e6vByClfB8V3OWyNEaN5kIgWH0Rr1Yfr

