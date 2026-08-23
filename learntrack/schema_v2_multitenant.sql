-- 1. Schools are now identified by their email domain (e.g. 'srieshwar.edu')
alter table schools add column if not exists email_domain text unique;

-- 2. A student can now be enrolled in multiple subjects at once.
-- Replaces the single users.domain column.
create table if not exists student_domains (
  student_id uuid references users(id) on delete cascade,
  domain text not null,
  primary key (student_id, domain)
);

-- Migrate any existing single-domain assignments into the new table
insert into student_domains (student_id, domain)
select id, domain from users
where role = 'student' and domain is not null
on conflict do nothing;

alter table users drop column if exists domain;

-- 3. Classes are no longer owned by one teacher.
-- Any teacher can access any class within their own school (school_id match).
alter table classes drop constraint if exists fk_teacher;
alter table classes drop column if exists teacher_id;

-- Backfill: set this to your actual school's email domain, e.g.:
-- update schools set email_domain = 'srieshwar.edu' where id = '<your-school-id>';
