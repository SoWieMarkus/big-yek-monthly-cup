FROM node:24

WORKDIR /usr/src/app

COPY . .

# Install dependencies
RUN npm install && npm install -g @angular/cli

# Build shared library
RUN npm run build --workspace=@bymc/shared


# Build frontend (run ng build inside frontend workspace)
WORKDIR /usr/src/app/packages/frontend
RUN ng build --configuration=production

# Setup Prisma in backend
WORKDIR /usr/src/app/packages/backend
ENV PORT=3000
ENV DATABASE_URL=file:/usr/src/app/bymc.db
RUN npx prisma generate && npm run build

EXPOSE $PORT

# Entrypoint: deploy migrations and start backend
RUN chmod +x /usr/src/app/packages/backend/entrypoint.sh
CMD ["/usr/src/app/packages/backend/entrypoint.sh"]