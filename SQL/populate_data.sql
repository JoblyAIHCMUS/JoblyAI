--
-- PostgreSQL database dump
--

\restrict uCphQOA3jlDYclf7MQoxUr3Wdd55tQDz0HtkWMdpNOGbpj271o6OijcH7j6cMBs

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

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: jobly
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public._prisma_migrations DISABLE TRIGGER ALL;

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('cafc4991-be4c-4b4f-80f2-ceb3d7df8793', 'c48702e048bf71a9b89eef59ef3006d5345b32665bcbb6f76d1fc07d47d91959', '2026-02-07 13:25:29.399302+00', '20260207054445_add_auth', NULL, NULL, '2026-02-07 13:25:29.394017+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('f827ccbc-367a-4c1e-af29-3c4e5e28e943', 'c19cc67eb2cec950e799337382fcbb6c74ed94e65b472330d2483f0629913214', '2026-02-07 13:25:29.408901+00', '20260207055625_auth', NULL, NULL, '2026-02-07 13:25:29.399759+00', 1);


ALTER TABLE public._prisma_migrations ENABLE TRIGGER ALL;

--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: jobly
--

ALTER TABLE public."user" DISABLE TRIGGER ALL;



ALTER TABLE public."user" ENABLE TRIGGER ALL;

--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: jobly
--

ALTER TABLE public.account DISABLE TRIGGER ALL;



ALTER TABLE public.account ENABLE TRIGGER ALL;

--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: jobly
--

ALTER TABLE public.session DISABLE TRIGGER ALL;



ALTER TABLE public.session ENABLE TRIGGER ALL;

--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: jobly
--

ALTER TABLE public.verification DISABLE TRIGGER ALL;



ALTER TABLE public.verification ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--

\unrestrict uCphQOA3jlDYclf7MQoxUr3Wdd55tQDz0HtkWMdpNOGbpj271o6OijcH7j6cMBs

