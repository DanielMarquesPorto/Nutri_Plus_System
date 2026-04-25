-- Habilita a extensão de UUID se não estiver habilitada
create extension if not exists "uuid-ossp";

-------------------------------------------------------
-- TABELA: nutricionistas
-------------------------------------------------------
create table public.nutricionistas (
    id uuid primary key default uuid_generate_v4(),
    nome text not null,
    email text not null unique,
    created_at timestamp with time zone default now()
);

-- Ativa RLS para nutricionistas
alter table public.nutricionistas enable row level security;

create policy "Nutricionistas podem gerenciar seu próprio perfil" 
on public.nutricionistas 
for all 
using ( auth.uid() = id )
with check ( auth.uid() = id );


-------------------------------------------------------
-- TABELA: pacientes
-------------------------------------------------------
create table public.pacientes (
    id uuid primary key default uuid_generate_v4(),
    nutricionista_id uuid references public.nutricionistas(id) on delete cascade,
    nome text not null,
    data_nascimento date,
    sexo text,
    telefone text,
    whatsapp text,
    email text,
    peso_inicial numeric,
    altura numeric,
    objetivos text[],
    objetivo_texto text,
    nivel_atividade text,
    patologias text[],
    restricoes_alimentares text[],
    alergias text[],
    medicamentos text,
    suplementos text,
    refeicoes_por_dia integer,
    horario_acorda text,
    horario_dorme text,
    litros_agua numeric,
    atividade_fisica boolean,
    atividade_fisica_descricao text,
    observacoes text,
    created_at timestamp with time zone default now()
);

-- Ativa RLS para pacientes
alter table public.pacientes enable row level security;

create policy "Acesso aos pacientes restrito ao nutricionista responsável" 
on public.pacientes 
for all 
using ( nutricionista_id = auth.uid() )
with check ( nutricionista_id = auth.uid() );


-------------------------------------------------------
-- TABELA: consultas
-------------------------------------------------------
create table public.consultas (
    id uuid primary key default uuid_generate_v4(),
    paciente_id uuid references public.pacientes(id) on delete cascade,
    data_consulta date not null,
    peso numeric,
    cintura numeric,
    quadril numeric,
    percentual_gordura numeric,
    observacoes text,
    proximo_retorno date,
    created_at timestamp with time zone default now()
);

-- Ativa RLS para consultas
alter table public.consultas enable row level security;

create policy "Acesso a consultas restrito via paciente pertencente ao nutricionista" 
on public.consultas 
for all 
using (
    exists (
        select 1 from public.pacientes
        where pacientes.id = consultas.paciente_id
        and pacientes.nutricionista_id = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.pacientes
        where pacientes.id = consultas.paciente_id
        and pacientes.nutricionista_id = auth.uid()
    )
);


-------------------------------------------------------
-- TABELA: planos_alimentares
-------------------------------------------------------
create table public.planos_alimentares (
    id uuid primary key default uuid_generate_v4(),
    paciente_id uuid references public.pacientes(id) on delete cascade,
    conteudo jsonb not null,
    created_at timestamp with time zone default now()
);

-- Ativa RLS para planos alimentares
alter table public.planos_alimentares enable row level security;

create policy "Acesso a planos alimentares restrito via paciente do nutricionista" 
on public.planos_alimentares 
for all 
using (
    exists (
        select 1 from public.pacientes
        where pacientes.id = planos_alimentares.paciente_id
        and pacientes.nutricionista_id = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.pacientes
        where pacientes.id = planos_alimentares.paciente_id
        and pacientes.nutricionista_id = auth.uid()
    )
);

-------------------------------------------------------
-- VERIFICAÇÃO FINAL
-------------------------------------------------------
-- As tabelas já podem ser listadas e verificadas no Dashboard do Supabase.
