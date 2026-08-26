# CrealyHub

Community Manager editorial autónomo y privado para Instagram. Las **Fases 1 y 2** están implementadas: fundaciones y Content Engine.

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

## Content Engine

`/create` permite encolar Posts, Stories y Carruseles. Los campos editoriales son opcionales: el planner completa el brief usando Brand Memory y contenido reciente.

El worker se ejecuta con una petición autenticada:

```bash
curl -X POST http://localhost:3000/api/jobs/generation \
  -H "Authorization: Bearer $CRON_SECRET"
```

Cada job es reclamado con lock y lease en PostgreSQL. El pipeline produce Structured Outputs, genera imágenes con GPT Image 2, normaliza los archivos a 1080×1350 o 1080×1920, los guarda en Storage propio y deja el contenido en `PENDING_APPROVAL`.

Los precios usados para estimación son configurables en `.env.local`; deben revisarse cuando cambie la tarifa del proveedor.
