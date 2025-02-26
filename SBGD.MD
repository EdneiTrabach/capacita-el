<!-- SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
 -->



| table_name          | column_name           | data_type                | character_maximum_length | is_nullable | column_default               |
| ------------------- | --------------------- | ------------------------ | ------------------------ | ----------- | ---------------------------- |
| avaliacoes_reacao   | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| avaliacoes_reacao   | curso_id              | uuid                     | null                     | YES         | null                         |
| avaliacoes_reacao   | usuario_id            | uuid                     | null                     | YES         | null                         |
| avaliacoes_reacao   | data_avaliacao        | timestamp with time zone | null                     | YES         | now()                        |
| avaliacoes_reacao   | satisfacao_geral      | integer                  | null                     | YES         | null                         |
| avaliacoes_reacao   | qualidade_conteudo    | integer                  | null                     | YES         | null                         |
| avaliacoes_reacao   | aplicabilidade        | integer                  | null                     | YES         | null                         |
| avaliacoes_reacao   | material_didatico     | integer                  | null                     | YES         | null                         |
| avaliacoes_reacao   | dominio_instrutor     | integer                  | null                     | YES         | null                         |
| avaliacoes_reacao   | comentarios           | text                     | null                     | YES         | null                         |
| avaliacoes_reacao   | sugestoes             | text                     | null                     | YES         | null                         |
| certificados        | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| certificados        | usuario_id            | uuid                     | null                     | YES         | null                         |
| certificados        | curso_id              | uuid                     | null                     | YES         | null                         |
| certificados        | data_conclusao        | date                     | null                     | NO          | null                         |
| certificados        | data_emissao          | timestamp with time zone | null                     | YES         | null                         |
| certificados        | observacoes           | text                     | null                     | YES         | null                         |
| certificados        | status                | text                     | null                     | YES         | 'pendente'::text             |
| certificados        | codigo                | text                     | null                     | YES         | null                         |
| certificados        | created_at            | timestamp with time zone | null                     | YES         | now()                        |
| certificados        | updated_at            | timestamp with time zone | null                     | YES         | now()                        |
| certificados_backup | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| certificados_backup | usuario_id            | uuid                     | null                     | YES         | null                         |
| certificados_backup | curso_id              | uuid                     | null                     | YES         | null                         |
| certificados_backup | data_conclusao        | date                     | null                     | NO          | null                         |
| certificados_backup | data_emissao          | timestamp with time zone | null                     | YES         | null                         |
| certificados_backup | observacoes           | text                     | null                     | YES         | null                         |
| certificados_backup | status                | text                     | null                     | YES         | 'pendente'::text             |
| certificados_backup | codigo                | text                     | null                     | YES         | null                         |
| certificados_backup | created_at            | timestamp with time zone | null                     | YES         | now()                        |
| certificados_backup | updated_at            | timestamp with time zone | null                     | YES         | now()                        |
| certificados_backup | backup_date           | timestamp with time zone | null                     | YES         | CURRENT_TIMESTAMP            |
| codigos_aula        | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| codigos_aula        | codigo                | text                     | null                     | NO          | null                         |
| codigos_aula        | curso_id              | uuid                     | null                     | YES         | null                         |
| codigos_aula        | data_aula             | date                     | null                     | NO          | null                         |
| codigos_aula        | validade              | timestamp with time zone | null                     | NO          | null                         |
| codigos_aula        | created_at            | timestamp with time zone | null                     | YES         | now()                        |
| codigos_aula        | horario_geracao       | timestamp with time zone | null                     | YES         | null                         |
| codigos_aula        | professor_id          | uuid                     | null                     | YES         | null                         |
| cursos              | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| cursos              | nome                  | text                     | null                     | NO          | null                         |
| cursos              | descricao             | text                     | null                     | YES         | null                         |
| cursos              | duracao_horas         | integer                  | null                     | NO          | null                         |
| cursos              | data_inicio           | date                     | null                     | NO          | null                         |
| cursos              | professor_responsavel | text                     | null                     | NO          | null                         |
| cursos              | status                | text                     | null                     | YES         | 'Em andamento'::text         |
| cursos              | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| cursos_backup       | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| cursos_backup       | nome                  | text                     | null                     | NO          | null                         |
| cursos_backup       | descricao             | text                     | null                     | YES         | null                         |
| cursos_backup       | duracao_horas         | integer                  | null                     | NO          | null                         |
| cursos_backup       | data_inicio           | date                     | null                     | NO          | null                         |
| cursos_backup       | professor_responsavel | text                     | null                     | NO          | null                         |
| cursos_backup       | status                | text                     | null                     | YES         | 'Em andamento'::text         |
| cursos_backup       | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| cursos_backup       | backup_date           | timestamp with time zone | null                     | YES         | CURRENT_TIMESTAMP            |
| lista_presenca      | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| lista_presenca      | aluno_id              | uuid                     | null                     | YES         | null                         |
| lista_presenca      | curso_id              | uuid                     | null                     | YES         | null                         |
| lista_presenca      | data_aula             | date                     | null                     | NO          | null                         |
| lista_presenca      | horario_registro      | timestamp with time zone | null                     | YES         | now()                        |
| lista_presenca      | status                | text                     | null                     | YES         | 'presente'::text             |
| lista_presenca      | feedback              | text                     | null                     | YES         | null                         |
| lista_presenca      | comentarios           | text                     | null                     | YES         | null                         |
| matriculas          | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| matriculas          | aluno_id              | uuid                     | null                     | YES         | null                         |
| matriculas          | curso_id              | uuid                     | null                     | YES         | null                         |
| matriculas          | data_matricula        | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| matriculas          | status                | character varying        | 20                       | YES         | 'ativo'::character varying   |
| matriculas          | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| matriculas          | updated_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| matriculas          | created_by            | uuid                     | null                     | YES         | null                         |
| matriculas_backup   | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| matriculas_backup   | aluno_id              | uuid                     | null                     | YES         | null                         |
| matriculas_backup   | curso_id              | uuid                     | null                     | YES         | null                         |
| matriculas_backup   | data_matricula        | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| matriculas_backup   | status                | character varying        | 20                       | YES         | 'ativo'::character varying   |
| matriculas_backup   | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| matriculas_backup   | updated_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| matriculas_backup   | backup_date           | timestamp with time zone | null                     | YES         | CURRENT_TIMESTAMP            |
| modulos             | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| modulos             | curso_id              | uuid                     | null                     | YES         | null                         |
| modulos             | nome                  | text                     | null                     | NO          | null                         |
| modulos             | carga_horaria         | integer                  | null                     | NO          | null                         |
| modulos             | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| modulos_backup      | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| modulos_backup      | curso_id              | uuid                     | null                     | YES         | null                         |
| modulos_backup      | nome                  | text                     | null                     | NO          | null                         |
| modulos_backup      | carga_horaria         | integer                  | null                     | NO          | null                         |
| modulos_backup      | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| modulos_backup      | backup_date           | timestamp with time zone | null                     | YES         | CURRENT_TIMESTAMP            |
| profiles            | id                    | uuid                     | null                     | NO          | null                         |
| profiles            | nome                  | text                     | null                     | YES         | null                         |
| profiles            | email                 | text                     | null                     | YES         | null                         |
| profiles            | status                | text                     | null                     | YES         | 'ativo'::text                |
| profiles            | telefone              | text                     | null                     | YES         | null                         |
| profiles            | documento             | text                     | null                     | YES         | null                         |
| profiles            | cidade                | text                     | null                     | YES         | null                         |
| profiles            | estado                | text                     | null                     | YES         | null                         |
| profiles            | setor                 | text                     | null                     | YES         | null                         |
| profiles            | data_nascimento       | date                     | null                     | YES         | null                         |
| profiles            | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| profiles            | role                  | character varying        | 20                       | YES         | 'user'::character varying    |
| setores             | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| setores             | nome                  | text                     | null                     | NO          | null                         |
| setores             | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| setores             | created_by            | uuid                     | null                     | YES         | null                         |
| setores             | updated_at            | timestamp with time zone | null                     | YES         | now()                        |
| setores_backup      | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| setores_backup      | nome                  | text                     | null                     | NO          | null                         |
| setores_backup      | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| setores_backup      | created_by            | uuid                     | null                     | YES         | null                         |
| setores_backup      | updated_at            | timestamp with time zone | null                     | YES         | now()                        |
| setores_backup      | backup_date           | timestamp with time zone | null                     | YES         | CURRENT_TIMESTAMP            |
| system_logs         | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| system_logs         | action                | text                     | null                     | NO          | null                         |
| system_logs         | details               | jsonb                    | null                     | YES         | null                         |
| system_logs         | user_id               | uuid                     | null                     | YES         | null                         |
| system_logs         | created_at            | timestamp with time zone | null                     | NO          | timezone('utc'::text, now()) |
| system_logs_backup  | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| system_logs_backup  | action                | text                     | null                     | NO          | null                         |
| system_logs_backup  | details               | jsonb                    | null                     | YES         | null                         |
| system_logs_backup  | user_id               | uuid                     | null                     | YES         | null                         |
| system_logs_backup  | created_at            | timestamp with time zone | null                     | NO          | timezone('utc'::text, now()) |
| system_logs_backup  | backup_date           | timestamp with time zone | null                     | YES         | CURRENT_TIMESTAMP            |
| users               | id                    | uuid                     | null                     | NO          | null                         |
| users               | email                 | text                     | null                     | YES         | null                         |
| users               | status                | boolean                  | null                     | YES         | true                         |
| users               | role                  | text                     | null                     | YES         | 'user'::text                 |
| users               | last_sign_in_at       | timestamp with time zone | null                     | YES         | null                         |
| users               | created_at            | timestamp with time zone | null                     | YES         | now()                        |
| users               | nome                  | text                     | null                     | YES         | null                         |
| users               | setor                 | text                     | null                     | YES         | null                         |
| users               | cidade                | text                     | null                     | YES         | null                         |
| users               | estado                | text                     | null                     | YES         | null                         |
| users               | telefone              | text                     | null                     | YES         | null                         |
| users               | data_nascimento       | date                     | null                     | YES         | null                         |
| usuarios            | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| usuarios            | nome                  | text                     | null                     | NO          | null                         |
| usuarios            | email                 | text                     | null                     | YES         | null                         |
| usuarios            | data_nascimento       | date                     | null                     | YES         | null                         |
| usuarios            | telefone              | text                     | null                     | YES         | null                         |
| usuarios            | documento             | text                     | null                     | YES         | null                         |
| usuarios            | cidade                | text                     | null                     | YES         | null                         |
| usuarios            | estado                | text                     | null                     | YES         | null                         |
| usuarios            | setor                 | text                     | null                     | YES         | null                         |
| usuarios            | status                | text                     | null                     | YES         | 'ativo'::text                |
| usuarios            | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| usuarios            | updated_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| usuarios            | profile_id            | uuid                     | null                     | YES         | auth.uid()                   |
| usuarios            | editado_id            | uuid                     | null                     | YES         | auth.uid()                   |
| usuarios_backup     | id                    | uuid                     | null                     | NO          | uuid_generate_v4()           |
| usuarios_backup     | nome                  | text                     | null                     | NO          | null                         |
| usuarios_backup     | email                 | text                     | null                     | YES         | null                         |
| usuarios_backup     | data_nascimento       | date                     | null                     | YES         | null                         |
| usuarios_backup     | telefone              | text                     | null                     | YES         | null                         |
| usuarios_backup     | documento             | text                     | null                     | YES         | null                         |
| usuarios_backup     | cidade                | text                     | null                     | YES         | null                         |
| usuarios_backup     | estado                | text                     | null                     | YES         | null                         |
| usuarios_backup     | setor                 | text                     | null                     | YES         | null                         |
| usuarios_backup     | status                | text                     | null                     | YES         | 'ativo'::text                |
| usuarios_backup     | created_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| usuarios_backup     | updated_at            | timestamp with time zone | null                     | YES         | timezone('utc'::text, now()) |
| usuarios_backup     | profile_id            | uuid                     | null                     | YES         | auth.uid()                   |
| usuarios_backup     | editado_id            | uuid                     | null                     | YES         | auth.uid()                   |
| usuarios_backup     | backup_date           | timestamp with time zone | null                     | YES         | CURRENT_TIMESTAMP            |