# CrealyHub

Community Manager editorial autónomo y privado para Instagram. La aplicación está en **Fase 1: Fundaciones**.

## Desarrollo

```bash
copy .env.example .env.local
npm install
npm run dev
```

Sin variables de Supabase la interfaz inicia en modo demo y no intenta autenticar ni escribir datos.

## Base de datos local

```bash
npm run db:start
npm run db:reset
```

Copia la URL, anon key y service role que muestra Supabase a `.env.local`. Crea un usuario desde Supabase Studio o Auth y entra desde `/login`.

## Seguridad

- Solo la URL y anon key de Supabase llegan al navegador.
- OpenAI y service role son server-only.
- RLS limita los datos al propietario de la marca.
- Review Mode está activo y Autopilot desactivado.

## Verificación

```bash
npm run lint
npm run typecheck
npm run build
```

La abstracción de OpenAI usa Responses API y Structured Outputs según la [documentación oficial](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create).
