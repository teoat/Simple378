--
-- PostgreSQL database dump
--

\restrict F8tBVtERRNYWaRCwYd9F1MdjUukvtIRh2l0JQodAbGYpDBvoBffCLfvqrYVhpIx

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: actiontype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.actiontype AS ENUM (
    'VIEW',
    'EDIT',
    'DELETE',
    'EXPORT'
);


ALTER TYPE public.actiontype OWNER TO postgres;

--
-- Name: consenttype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.consenttype AS ENUM (
    'EXPLICIT',
    'LEGITIMATE_INTEREST',
    'LEGAL_OBLIGATION'
);


ALTER TYPE public.consenttype OWNER TO postgres;

--
-- Name: feedbacktype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.feedbacktype AS ENUM (
    'POSITIVE',
    'NEGATIVE'
);


ALTER TYPE public.feedbacktype OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_conversations (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    session_id character varying NOT NULL,
    message_count integer,
    started_at timestamp without time zone NOT NULL,
    ended_at timestamp without time zone
);


ALTER TABLE public.ai_conversations OWNER TO postgres;

--
-- Name: ai_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_feedback (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    message_id character varying NOT NULL,
    feedback_type public.feedbacktype NOT NULL,
    conversation_context character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.ai_feedback OWNER TO postgres;

--
-- Name: ai_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_metrics (
    id uuid NOT NULL,
    metric_type character varying NOT NULL,
    metric_value double precision NOT NULL,
    context character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.ai_metrics OWNER TO postgres;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: analysis_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analysis_results (
    id uuid NOT NULL,
    subject_id uuid NOT NULL,
    status character varying,
    risk_score double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    adjudication_status character varying,
    decision character varying,
    reviewer_notes character varying,
    reviewer_id uuid,
    chain_of_custody json
);


ALTER TABLE public.analysis_results OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    actor_id uuid,
    action public.actiontype NOT NULL,
    resource_id uuid NOT NULL,
    "timestamp" timestamp without time zone,
    details json
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: consents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consents (
    id uuid NOT NULL,
    subject_id uuid,
    consent_type public.consenttype NOT NULL,
    granted_at timestamp without time zone,
    expires_at timestamp without time zone
);


ALTER TABLE public.consents OWNER TO postgres;

--
-- Name: indicators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.indicators (
    id uuid NOT NULL,
    analysis_result_id uuid NOT NULL,
    type character varying NOT NULL,
    confidence double precision,
    evidence json,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.indicators OWNER TO postgres;

--
-- Name: mfa_backup_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mfa_backup_codes (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    code_hash character varying NOT NULL,
    used boolean NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mfa_backup_codes OWNER TO postgres;

--
-- Name: oauth_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth_accounts (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    provider character varying NOT NULL,
    provider_user_id character varying NOT NULL,
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.oauth_accounts OWNER TO postgres;

--
-- Name: search_annotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_annotations (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    document_id character varying NOT NULL,
    annotation_type character varying NOT NULL,
    content character varying NOT NULL,
    "position" json,
    is_private boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.search_annotations OWNER TO postgres;

--
-- Name: search_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_history (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    query character varying NOT NULL,
    search_type character varying,
    filters json,
    result_count integer,
    search_time_ms integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.search_history OWNER TO postgres;

--
-- Name: search_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_sessions (
    id uuid NOT NULL,
    name character varying NOT NULL,
    description character varying,
    created_by uuid NOT NULL,
    case_id uuid,
    is_active boolean,
    participant_ids json,
    session_data json,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.search_sessions OWNER TO postgres;

--
-- Name: search_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_templates (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    description character varying,
    query character varying NOT NULL,
    search_type character varying,
    filters json,
    is_public boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.search_templates OWNER TO postgres;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id uuid NOT NULL,
    encrypted_pii json NOT NULL,
    created_at timestamp without time zone,
    retention_policy_id character varying
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid NOT NULL,
    subject_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying,
    date timestamp without time zone NOT NULL,
    description character varying,
    source_bank character varying NOT NULL,
    source_file_id character varying,
    external_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: user_mfa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_mfa (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    method character varying NOT NULL,
    secret character varying NOT NULL,
    phone character varying,
    email character varying,
    enabled boolean NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.user_mfa OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying NOT NULL,
    hashed_password character varying NOT NULL,
    full_name character varying,
    role character varying,
    created_at timestamp without time zone,
    email_verified boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webauthn_credentials (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    credential_id character varying NOT NULL,
    public_key character varying NOT NULL,
    sign_count integer NOT NULL,
    device_type character varying,
    transports json,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used timestamp with time zone
);


ALTER TABLE public.webauthn_credentials OWNER TO postgres;

--
-- Data for Name: ai_conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_conversations (id, user_id, session_id, message_count, started_at, ended_at) FROM stdin;
\.


--
-- Data for Name: ai_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_feedback (id, user_id, message_id, feedback_type, conversation_context, created_at) FROM stdin;
\.


--
-- Data for Name: ai_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_metrics (id, metric_type, metric_value, context, created_at) FROM stdin;
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
990bce74e362
\.


--
-- Data for Name: analysis_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analysis_results (id, subject_id, status, risk_score, created_at, updated_at, adjudication_status, decision, reviewer_notes, reviewer_id, chain_of_custody) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, actor_id, action, resource_id, "timestamp", details) FROM stdin;
\.


--
-- Data for Name: consents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consents (id, subject_id, consent_type, granted_at, expires_at) FROM stdin;
\.


--
-- Data for Name: indicators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.indicators (id, analysis_result_id, type, confidence, evidence, created_at) FROM stdin;
\.


--
-- Data for Name: mfa_backup_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mfa_backup_codes (id, user_id, code_hash, used, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth_accounts (id, user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: search_annotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_annotations (id, user_id, document_id, annotation_type, content, "position", is_private, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: search_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_history (id, user_id, query, search_type, filters, result_count, search_time_ms, created_at) FROM stdin;
\.


--
-- Data for Name: search_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_sessions (id, name, description, created_by, case_id, is_active, participant_ids, session_data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: search_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_templates (id, user_id, name, description, query, search_type, filters, is_public, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, encrypted_pii, created_at, retention_policy_id) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, subject_id, amount, currency, date, description, source_bank, source_file_id, external_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_mfa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_mfa (id, user_id, method, secret, phone, email, enabled, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, hashed_password, full_name, role, created_at, email_verified) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webauthn_credentials (id, user_id, credential_id, public_key, sign_count, device_type, transports, created_at, last_used) FROM stdin;
\.


--
-- Name: ai_conversations ai_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_pkey PRIMARY KEY (id);


--
-- Name: ai_feedback ai_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_feedback
    ADD CONSTRAINT ai_feedback_pkey PRIMARY KEY (id);


--
-- Name: ai_metrics ai_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_metrics
    ADD CONSTRAINT ai_metrics_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: analysis_results analysis_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: consents consents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_pkey PRIMARY KEY (id);


--
-- Name: indicators indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.indicators
    ADD CONSTRAINT indicators_pkey PRIMARY KEY (id);


--
-- Name: mfa_backup_codes mfa_backup_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mfa_backup_codes
    ADD CONSTRAINT mfa_backup_codes_pkey PRIMARY KEY (id);


--
-- Name: oauth_accounts oauth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_pkey PRIMARY KEY (id);


--
-- Name: search_annotations search_annotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_annotations
    ADD CONSTRAINT search_annotations_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: search_sessions search_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_sessions
    ADD CONSTRAINT search_sessions_pkey PRIMARY KEY (id);


--
-- Name: search_templates search_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_templates
    ADD CONSTRAINT search_templates_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_mfa user_mfa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_mfa
    ADD CONSTRAINT user_mfa_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: idx_oauth_provider_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_oauth_provider_user ON public.oauth_accounts USING btree (provider, provider_user_id);


--
-- Name: idx_user_mfa_user_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_mfa_user_method ON public.user_mfa USING btree (user_id, method);


--
-- Name: ix_ai_conversations_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ai_conversations_session_id ON public.ai_conversations USING btree (session_id);


--
-- Name: ix_ai_feedback_message_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ai_feedback_message_id ON public.ai_feedback USING btree (message_id);


--
-- Name: ix_ai_metrics_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ai_metrics_created_at ON public.ai_metrics USING btree (created_at);


--
-- Name: ix_mfa_backup_codes_code_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_mfa_backup_codes_code_hash ON public.mfa_backup_codes USING btree (code_hash);


--
-- Name: ix_mfa_backup_codes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_mfa_backup_codes_user_id ON public.mfa_backup_codes USING btree (user_id);


--
-- Name: ix_oauth_accounts_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_oauth_accounts_provider ON public.oauth_accounts USING btree (provider);


--
-- Name: ix_oauth_accounts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_oauth_accounts_user_id ON public.oauth_accounts USING btree (user_id);


--
-- Name: ix_user_mfa_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_mfa_user_id ON public.user_mfa USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_webauthn_credentials_credential_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_webauthn_credentials_credential_id ON public.webauthn_credentials USING btree (credential_id);


--
-- Name: ix_webauthn_credentials_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_webauthn_credentials_user_id ON public.webauthn_credentials USING btree (user_id);


--
-- Name: ai_conversations ai_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ai_feedback ai_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_feedback
    ADD CONSTRAINT ai_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: analysis_results analysis_results_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: analysis_results analysis_results_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: consents consents_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: indicators indicators_analysis_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.indicators
    ADD CONSTRAINT indicators_analysis_result_id_fkey FOREIGN KEY (analysis_result_id) REFERENCES public.analysis_results(id);


--
-- Name: mfa_backup_codes mfa_backup_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mfa_backup_codes
    ADD CONSTRAINT mfa_backup_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: oauth_accounts oauth_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: search_annotations search_annotations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_annotations
    ADD CONSTRAINT search_annotations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: search_history search_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: search_sessions search_sessions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_sessions
    ADD CONSTRAINT search_sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: search_templates search_templates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_templates
    ADD CONSTRAINT search_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: user_mfa user_mfa_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_mfa
    ADD CONSTRAINT user_mfa_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict F8tBVtERRNYWaRCwYd9F1MdjUukvtIRh2l0JQodAbGYpDBvoBffCLfvqrYVhpIx

