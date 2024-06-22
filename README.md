<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# TesloShop Backend

## Dev

1. Clonar repositorio.
2. Instalar las dependencias.

```bash
yarn install
```

3. Renombrar y editar el archivo ``.env.template`` a ``.env``, seguido de las variables solicitadas.
4. Levantar la base de datos

```bash
podman-compose up -d
```

5. Ejecutamos la aplicación

```bash
yarn start:dev
```

6. Cargamos la data de prueba (seed)

```www3
http://localhost:3000/seed
```
