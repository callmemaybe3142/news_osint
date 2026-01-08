create table public.person (
  id uuid not null,
  name text null,
  nrc_no text null,
  blood_group text null,
  religion text null,
  race text null,
  spouse_name text null,
  father_name text null,
  mother_name text null,
  birthdate date null,
  appointment_date date null,
  retire_date date null,
  entry_date date null,
  depletion_type text null,
  sac boolean null,
  constraint person_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_person_name on public.person using btree (name) TABLESPACE pg_default;

create index IF not exists idx_person_nrc_no on public.person using btree (nrc_no) TABLESPACE pg_default;


create table public.addresses (
  id serial not null,
  person_id uuid not null,
  address text null,
  permanent boolean null default false,
  constraint addresses_pkey primary key (id),
  constraint addresses_person_id_address_key unique (person_id, address),
  constraint addresses_person_id_fkey foreign KEY (person_id) references person (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.countries (
  country_id serial not null,
  country_name text not null,
  constraint countries_pkey primary key (country_id)
) TABLESPACE pg_default;

create table public.country_join (
  person_id uuid not null,
  country_id integer not null,
  constraint country_join_pkey primary key (person_id, country_id),
  constraint country_join_country_id_fkey foreign KEY (country_id) references countries (country_id) on delete CASCADE,
  constraint country_join_person_id_fkey foreign KEY (person_id) references person (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.departments (
  department_id serial not null,
  department text null,
  ministry text null,
  constraint departments_pkey primary key (department_id)
) TABLESPACE pg_default;

create table public.educations (
  education_id serial not null,
  education_name text not null,
  constraint educations_pkey primary key (education_id)
) TABLESPACE pg_default;

create table public.education_join (
  person_id uuid not null,
  education_id integer not null,
  constraint education_join_pkey primary key (person_id, education_id),
  constraint education_join_education_id_fkey foreign KEY (education_id) references educations (education_id) on delete CASCADE,
  constraint education_join_person_id_fkey foreign KEY (person_id) references person (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.ministries (
  ministry_id serial not null,
  ministry_name text not null,
  constraint ministries_pkey primary key (ministry_id)
) TABLESPACE pg_default;


create table public.md_join (
  person_id uuid not null,
  ministry_id integer not null,
  department_id integer not null,
  constraint md_join_pkey primary key (person_id, ministry_id, department_id),
  constraint md_join_department_id_fkey foreign KEY (department_id) references departments (department_id) on delete CASCADE,
  constraint md_join_ministry_id_fkey foreign KEY (ministry_id) references ministries (ministry_id) on delete CASCADE,
  constraint md_join_person_id_fkey foreign KEY (person_id) references person (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_md_join_person_id on public.md_join using btree (person_id) TABLESPACE pg_default;

create index IF not exists idx_md_join_department_id on public.md_join using btree (department_id) TABLESPACE pg_default;

create table public.positions (
  position_id serial not null,
  position_name text not null,
  rank smallint null,
  constraint positions_pkey primary key (position_id)
) TABLESPACE pg_default;

create table public.position_join (
  person_id uuid not null,
  position_id integer not null,
  constraint position_join_pkey primary key (person_id, position_id),
  constraint position_join_person_id_fkey foreign KEY (person_id) references person (id) on delete CASCADE,
  constraint position_join_position_id_fkey foreign KEY (position_id) references positions (position_id) on delete CASCADE
) TABLESPACE pg_default;

create table public.punishments (
  punishment_id serial not null,
  punishment_description text not null,
  constraint punishments_pkey primary key (punishment_id)
) TABLESPACE pg_default;

create table public.punishment_join (
  person_id uuid not null,
  punishment_id integer not null,
  constraint punishment_join_pkey primary key (person_id, punishment_id),
  constraint punishment_join_person_id_fkey foreign KEY (person_id) references person (id) on delete CASCADE,
  constraint punishment_join_punishment_id_fkey foreign KEY (punishment_id) references punishments (punishment_id) on delete CASCADE
) TABLESPACE pg_default;

create table public.trainings (
  id serial not null,
  person_id uuid not null,
  course text null,
  start_date date null,
  end_date date null,
  location text null,
  is_international boolean null default false,
  constraint trainings_pkey primary key (id),
  constraint trainings_person_id_fkey foreign KEY (person_id) references person (id) on delete CASCADE
) TABLESPACE pg_default;
