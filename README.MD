# classroom-frontend

<div align="center" style="margin: 30px;">
    <a href="https://refine.dev">
    <img alt="refine logo" src="https://refine.ams3.cdn.digitaloceanspaces.com/readme/refine-readme-banner.png">
    </a>
</div>
<br/>

This [Refine](https://github.com/refinedev/refine) project was generated with [create refine-app](https://github.com/refinedev/refine/tree/master/packages/create-refine-app).

## Getting Started

A React Framework for building internal tools, admin panels, dashboards & B2B apps with unmatched flexibility ✨

Refine's hooks and components simplifies the development process and eliminates the repetitive tasks by providing industry-standard solutions for crucial aspects of a project, including authentication, access control, routing, networking, state management, and i18n.

## Backend URL configuration

Set `VITE_BACKEND_BASE_URL` to the backend API base URL for both development and production builds. For local development, add it to `classroom-frontend/.env`:

```env
VITE_BACKEND_BASE_URL=http://localhost:8000/api/
```

Vite reads this value when starting the development server and when creating a production build. For a non-Docker production build, provide it in `.env.production` or in the build environment, using the URL browsers can reach for the deployed backend. The value is embedded in the frontend bundle at build time; setting it only when the container starts will not change it.

When building the Docker image from the `classroom-frontend` directory, pass the value as a build argument:

```bash
docker build --build-arg VITE_BACKEND_BASE_URL=https://api.example.com/api/ -t classroom-frontend .
```

## Available Scripts

### Running the development server.

```bash
    npm run dev
```

### Building for production.

```bash
    npm run build
```

### Running the production server.

```bash
    npm run start
```

## Learn More

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)
- **shadcn/ui** [Docs](https://refine.dev/docs/guides-concepts/general-concepts/#headless-concept)
- **React Router** [Docs](https://refine.dev/docs/core/providers/router-provider/)

## License

MIT
