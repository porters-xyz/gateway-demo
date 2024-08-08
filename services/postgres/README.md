# Postgres schema

This is shared by the portal backend and the proxy, thus it is separated out to
clarify its place in the architectural diagram. The containers depending on it
should have "registry.fly.io/porters-schema" as a parent and if changes need to
be pushed run the following commands:

`fly auth docker`
and
`docker push <img> docker://registry.fly.io/porters-schema:<tag>`

This makes the docker image available in fly.io for the images dependent on it.
Currently the golang code doesn't generate any code from the schema, but this
could change in the future.


## Running locally

To run locally you may need to pull the `porters-schema` docker image manually through `docker pull docker.io/library/porters-schema:latest`

The migrations will run and set up the database based ont he `DATABASE_URL` connection string. To seed the database, bash into the container and run `ts-node seed.ts`