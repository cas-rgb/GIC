alter table sources
  drop constraint if exists sources_source_type_check;

alter table sources
  add constraint sources_source_type_check
  check (
    source_type in (
      'news',
      'gov',
      'internal',
      'social',
      'ngo',
      'treasury',
      'utility',
      'stats',
      'research',
      'watchdog'
    )
  );
