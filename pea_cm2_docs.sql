--
-- PostgreSQL database dump
--

\restrict Mvs30Zn2hwOLHe9rfChuccfgAqTWcjOdihCz0baEYl7VTzFCvxa2Ag57eZPgRP1

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-20 14:31:14

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 16592)
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    message text NOT NULL,
    author character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16591)
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 229
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- TOC entry 222 (class 1259 OID 16520)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    cat_id integer NOT NULL,
    cat_name character varying(100) NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16519)
-- Name: categories_cat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_cat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_cat_id_seq OWNER TO postgres;

--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_cat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_cat_id_seq OWNED BY public.categories.cat_id;


--
-- TOC entry 228 (class 1259 OID 16580)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    dept_id integer NOT NULL,
    dept_name character varying(255) NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16579)
-- Name: departments_dept_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_dept_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_dept_id_seq OWNER TO postgres;

--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 227
-- Name: departments_dept_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_dept_id_seq OWNED BY public.departments.dept_id;


--
-- TOC entry 224 (class 1259 OID 16543)
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    doc_id integer NOT NULL,
    doc_name character varying(255) NOT NULL,
    cat_id integer,
    file_url text NOT NULL,
    file_size character varying(20),
    require_login boolean DEFAULT false,
    fiscal_year integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dept character varying(255),
    owner character varying(255),
    status character varying(50),
    download_count integer DEFAULT 0,
    approver_id integer,
    description text
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16542)
-- Name: documents_doc_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documents_doc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_doc_id_seq OWNER TO postgres;

--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 223
-- Name: documents_doc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documents_doc_id_seq OWNED BY public.documents.doc_id;


--
-- TOC entry 226 (class 1259 OID 16563)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    emp_id integer NOT NULL,
    emp_email character varying(150) NOT NULL,
    emp_password character varying(255),
    emp_name character varying(100) NOT NULL,
    dept_name character varying(100),
    role character varying(50) DEFAULT 'User'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    emp_phone character varying(20),
    emp_gender character varying(20),
    reset_password_token text,
    reset_password_expires timestamp without time zone,
    status character varying(50) DEFAULT 'ใช้งานอยู่'::character varying,
    avatar text
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16562)
-- Name: employees_emp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_emp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_emp_id_seq OWNER TO postgres;

--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 225
-- Name: employees_emp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_emp_id_seq OWNED BY public.employees.emp_id;


--
-- TOC entry 220 (class 1259 OID 16514)
-- Name: public_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.public_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.public_users_id_seq OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: public_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.public_users (
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255) CONSTRAINT "ีีusers_public_email_not_null" NOT NULL,
    phone_no character varying(20),
    password_hash text CONSTRAINT "ีีusers_public_password_hash_not_null" NOT NULL,
    gender character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role character varying(100),
    id bigint DEFAULT nextval('public.public_users_id_seq'::regclass) NOT NULL,
    status character varying(50) DEFAULT 'ใช้งานอยู่'::character varying,
    reset_password_token character varying(255),
    reset_password_expires timestamp with time zone
);


ALTER TABLE public.public_users OWNER TO postgres;

--
-- TOC entry 4794 (class 2604 OID 16595)
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 16523)
-- Name: categories cat_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN cat_id SET DEFAULT nextval('public.categories_cat_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 16583)
-- Name: departments dept_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN dept_id SET DEFAULT nextval('public.departments_dept_id_seq'::regclass);


--
-- TOC entry 4785 (class 2604 OID 16546)
-- Name: documents doc_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents ALTER COLUMN doc_id SET DEFAULT nextval('public.documents_doc_id_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 16566)
-- Name: employees emp_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN emp_id SET DEFAULT nextval('public.employees_emp_id_seq'::regclass);


--
-- TOC entry 4971 (class 0 OID 16592)
-- Dependencies: 230
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, message, author, created_at) FROM stdin;
1	ประกาศระบบจะทำการปิดปรับปรุงชั่วคราวระหว่างวันที่ 28-30 มกราคม 2569 	Admin Ratchaneekorn	2026-01-28 11:34:56.066894
\.


--
-- TOC entry 4963 (class 0 OID 16520)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (cat_id, cat_name) FROM stdin;
4	กฏระเบียบ นโยบาย และข้อบังคับ
5	คู่มือและ SOP
6	เอกสารแบบฟอร์ม
7	เอกสารการจัดซื้อจัดจ้าง
8	เอกสารรายงานประจำปี
9	คำสั่งและประกาศ
\.


--
-- TOC entry 4969 (class 0 OID 16580)
-- Dependencies: 228
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (dept_id, dept_name) FROM stdin;
1	กองบริหาร
2	แผนกสนับสนุน
4	แผนกบริการลูกค้าสัมพันธ์
3	แผนกมิเตอร์หม้อแปลง
6	แผนกปฏิบัติการ
7	แผนกก่อสร้างระบบไฟฟ้า
\.


--
-- TOC entry 4965 (class 0 OID 16543)
-- Dependencies: 224
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (doc_id, doc_name, cat_id, file_url, file_size, require_login, fiscal_year, created_at, dept, owner, status, download_count, approver_id, description) FROM stdin;
7	5.0-ใบยืนยันการส่งชิ้นงาน	4	uploads/5.0-ใบยืนยันการส่งชิ้นงาน.pdf	0.23 MB	f	2026	2026-01-07 13:57:54.360962	กองบริหาร	Admin Ratchaneekorn	อนุมัติแล้ว	0	\N	\N
8	ครั้งที่2 Presentation	4	uploads/ครั้งที่2 Presentation.pdf	5.06 MB	f	2026	2026-01-08 10:14:09.82137	กองบริหาร	Admin Ratchaneekorn	อนุมัติแล้ว	0	\N	\N
9	ครั้งที่2 Presentation	4	uploads/ครั้งที่2 Presentation.pdf	5.06 MB	f	2026	2026-01-08 10:14:09.895204	กองบริหาร	Admin Ratchaneekorn	อนุมัติแล้ว	0	\N	\N
13	หนังสือคืนรถยนต์	6	uploads/หนังสือคืนรถยนต์.pdf	0.07 MB	f	2026	2026-01-15 15:18:34.016707	กองบริหาร	Admin Ratchaneekorn	อนุมัติแล้ว	0	\N	\N
10	คำร้องรับโอนชื่อผู้ใช้ไฟฟ้า_แบบที่_2_กรณีผู้โอนไม่ต้องมาทำการโอนที่_กฟฟ	4	uploads/คำร้องรับโอนชื่อผู้ใช้ไฟฟ้า_แบบที่_2_กรณีผู้โอนไม่ต้องมาทำการโอนที่_กฟฟ.pdf	0.38 MB	f	2026	2026-01-15 09:46:40.070597	กองบริหาร	Admin Ratchaneekorn	อนุมัติแล้ว	0	\N	\N
19	1769671714819.pdf	6	/uploads/1769672674044.pdf	0.07 MB	f	\N	2026-01-29 14:44:34.374302	\N	สมศรี ศรีสม	อนุมัติแล้ว	0	7	
25	1770866133450	5	uploads/1770866133450.pdf	5.06 MB	f	2026	2026-02-12 11:51:33.132453	กองบริหาร	Admin Ratchaneekorn	อนุมัติแล้ว	0	\N	\N
17	Slide  2024 โมเดลรถจำลองสำหรับการขับเคลื่อนอัตโนมัติหักหลบสิ่งกีดขว้างโดยใช้ บอรด์CorgiDude	6	uploads/Slide  2024 โมเดลรถจำลองสำหรับการขับเคลื่อนอัตโนมัติหักหลบสิ่งกีดขว้างโดยใช้ บอรด์CorgiDude.pdf	170.96 MB	t	2026	2026-01-20 14:35:19.930238	กองบริหาร	สมศรี ศรีสม	อนุมัติแล้ว	2	\N	\N
\.


--
-- TOC entry 4967 (class 0 OID 16563)
-- Dependencies: 226
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (emp_id, emp_email, emp_password, emp_name, dept_name, role, created_at, emp_phone, emp_gender, reset_password_token, reset_password_expires, status, avatar) FROM stdin;
5	somsri_sri002@pea.co.th	$2b$10$VyY4Ys0dyMYVBWIKoXI4wO.1ITJ8roGODl6fxGZuFM0aJTYe7dzg.	สมศรี ศรีสม	กองบริหาร	พนักงานทั่วไป	2026-01-07 11:09:37.607496	06087290	หญิง	\N	\N	ใช้งานอยู่	https://i.pravatar.cc/150?u=staff
2	nakhun_bo250@pea.co.th	$2b$10$vI87kbSsh8pUnTPOvG57be.Y6.H.hIIn8H.8H.8H.8H.8H.8H.8H.	ณคุณ บุญลือ	ฝ่ายบริหารทรัพยากรบุคคล	พนักงานทั่วไป	2026-01-05 14:06:49.804108	0698004433	ชาย	\N	\N	ใช้งานอยู่	https://i.pravatar.cc/150?u=staff
4	tommy_tomtom@pea.co.th	$2b$10$vI87kbSsh8pUnTPOvG57be.Y6.H.hIIn8H.8H.8H.8H.8H.8H.8H.	ทอมมี่ ทอมทอม	ฝ่ายวิศวกรรม	พนักงานทั่วไป	2026-01-06 11:25:21.0782	080720850	ชาย	\N	\N	ใช้งานอยู่	https://i.pravatar.cc/150?u=staff
6	nana_na206@pea.co.th	$2b$10$vI87kbSsh8pUnTPOvG57be.Y6.H.hIIn8H.8H.8H.8H.8H.8H.8H.	นานา นานา	แผนกมิเตอร์หม้อแปลง	หัวหน้าแผนก	2026-01-07 13:14:48.015737	0807298256	หญิง	\N	\N	ใช้งานอยู่	https://i.pravatar.cc/150?u=staff
1	admin.ratcha@pea.co.th	$2b$10$F.UJwf4o8z16ZDUfGC/.Mu8vXSr5un2Dc1m2G2IvQQKTcRLghVGt2	Admin Ratchaneekorn	กองบริหาร	Admin	2026-01-05 10:56:39.885469	0601174040	หญิง	\N	\N	ใช้งานอยู่	https://i.pravatar.cc/150?u=staff
7	tankhun_mee2009@pea.ac.th	$2b$10$Ykl1PVuocv661Q21X9fiL.Xc6izM5j2ieJ7ViMmv6riAoVDz3gPSq	แทนคุณ มีชัย	แผนกปฏิบัติการ	หัวหน้าแผนก	2026-01-23 13:55:39.182295	0877298260	ชาย	\N	\N	ใช้งานอยู่	https://i.pravatar.cc/150?u=staff
3	mana_malaew01@pea.co.th	$2b$10$vI87kbSsh8pUnTPOvG57be.Y6.H.hIIn8H.8H.8H.8H.8H.8H.8H.	มานะ มาแล้ว	ฝ่ายวิศวกรรม	พนักงานทั่วไป	2026-01-05 15:13:58.492687	0608208296	ชาย	\N	\N	ใช้งานอยู่	https://i.pravatar.cc/150?u=staff
\.


--
-- TOC entry 4960 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: public_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.public_users (first_name, last_name, email, phone_no, password_hash, gender, created_at, updated_at, role, id, status, reset_password_token, reset_password_expires) FROM stdin;
ธนา	ทีที	thana_th666@gmail.com	0800728569	$2b$10$Zxz/yjWHyxC.DHLKKRt45OvmV8rd6AlNKhRnsQOx1Jhv8CIG5MxG6	male	2026-01-14 11:44:00.34315+07	2026-01-14 11:44:00.34315+07	public	11	ใช้งานอยู่	\N	\N
มีคุณ	มีจริงจริง	meekhun_mee202@gmail.com	0857434360	$2b$10$JGUB6ckKKiyUIMBeTO./M.fvJewYc2CYVp7ylkAFkXQmTj7Ri9Lna	male	2026-01-14 11:55:27.258897+07	2026-01-14 11:55:27.258897+07	public	12	ใช้งานอยู่	\N	\N
Ratchaneekorn	Chuadee	ratchaneekorn.c2000@gmail.com	0611174040	$2b$10$Bjao..RGHowuokOiki6pyODb1AGIenLfl7Z2wqSdaZK5Uchr5MQN.	female	2025-12-12 15:55:03.762213+07	2025-12-12 15:55:03.762213+07	\N	3	ใช้งานอยู่	\N	\N
สมชาย	ใจดี	somchai.jai200@gmail.com	061117920	$	male	2025-12-12 15:49:03.372256+07	2025-12-12 15:49:03.372256+07	\N	1	ใช้งานอยู่	\N	\N
สมบูรณ์	สุขใจ	somboon.sb020@gmail.com	0617298260	$	male	2025-12-12 15:53:31.759528+07	2025-12-12 15:53:31.759528+07	\N	2	ใช้งานอยู่	\N	\N
สมหญิง	จริงใจ	somying_sj00@gmail.com	0819207260	$	female	2025-12-15 08:35:46.869112+07	2025-12-15 08:35:46.869112+07	public	4	ใช้งานอยู่	\N	\N
มะลิซ้อน	สุขดี	mali_sorn002@gmail.com	0667004296	$	female	2025-12-15 08:41:33.199538+07	2025-12-15 08:41:33.199538+07	public	5	ใช้งานอยู่	\N	\N
malisorn	sukdee	mali_sorn002@gmailc.om	0667004296	$	female	2025-12-15 09:03:14.432218+07	2025-12-15 09:03:14.432218+07	public	6	ใช้งานอยู่	\N	\N
สมชัย	โชคดี	somchai_ch202@gmail.com	0927207460	$	male	2025-12-15 10:50:23.702909+07	2025-12-15 10:50:23.702909+07	public	7	ใช้งานอยู่	\N	\N
ratchaneekorn	chuadee	ratchaneekorn.ch200@gmail.com	0611174040	$2b$10$Ouqk/4aQxl/ncY7auMLo1.37ptsSQMwp897rdyGXdsvkgo4my0D3m	female	2025-12-15 15:51:57.782144+07	2025-12-15 15:51:57.782144+07	public	8	ใช้งานอยู่	\N	\N
สมสม	หญิงหญิง	somsom_y100@gmail.com	0523377334	$2b$10$fqT1P1z7/49um45ycBqNVeYxvc3scqHvr9un//VolVuQemAcUVctq	female	2025-12-16 09:53:03.943149+07	2025-12-16 09:53:03.943149+07	public	9	ใช้งานอยู่	\N	\N
สมบุญ	ใจดีดี	sombjai_deedee10@gmail.com	06720904433	$2b$10$8AHa0dCSEYWKhWUY90INnenaNvSI9jQKcxfcE9sdMtYmVNZEWTjFK	male	2025-12-16 10:46:54.203145+07	2025-12-16 10:46:54.203145+07	public	10	ใช้งานอยู่	\N	\N
\.


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 229
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, true);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_cat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_cat_id_seq', 9, true);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 227
-- Name: departments_dept_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_dept_id_seq', 7, true);


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 223
-- Name: documents_doc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_doc_id_seq', 28, true);


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 225
-- Name: employees_emp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_emp_id_seq', 7, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 220
-- Name: public_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.public_users_id_seq', 12, true);


--
-- TOC entry 4811 (class 2606 OID 16602)
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 16527)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (cat_id);


--
-- TOC entry 4807 (class 2606 OID 16589)
-- Name: departments departments_dept_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_dept_name_key UNIQUE (dept_name);


--
-- TOC entry 4809 (class 2606 OID 16587)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (dept_id);


--
-- TOC entry 4801 (class 2606 OID 16556)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (doc_id);


--
-- TOC entry 4803 (class 2606 OID 16577)
-- Name: employees employees_emp_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_emp_email_key UNIQUE (emp_email);


--
-- TOC entry 4805 (class 2606 OID 16575)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (emp_id);


--
-- TOC entry 4797 (class 2606 OID 16518)
-- Name: public_users public_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.public_users
    ADD CONSTRAINT public_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 16557)
-- Name: documents fk_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_category FOREIGN KEY (cat_id) REFERENCES public.categories(cat_id) ON DELETE CASCADE;


-- Completed on 2026-02-20 14:31:15

--
-- PostgreSQL database dump complete
--

\unrestrict Mvs30Zn2hwOLHe9rfChuccfgAqTWcjOdihCz0baEYl7VTzFCvxa2Ag57eZPgRP1

