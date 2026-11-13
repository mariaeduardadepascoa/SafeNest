-- Uma abertura pelo app não tem uma tag RFID associada.
alter table public.acessos alter column id_tag drop not null;
alter table public.acessos add column origem text not null default 'rfid';
alter table public.acessos add constraint acessos_origem_valida
  check (origem in ('rfid', 'aplicativo'));
alter table public.acessos add constraint acessos_tag_da_origem
  check ((origem = 'rfid' and id_tag is not null) or (origem = 'aplicativo' and id_tag is null));
