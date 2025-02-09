# Используем официальный Node.js образ с нужной версией
FROM node:20

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и yarn.lock файлы
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install

# Копируем код приложения
COPY . .

# Устанавливаем переменные окружения
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Собираем Vue приложение для production
# RUN nohup node server.mjs &

# Экспозируем порт
EXPOSE 3000

# Команда по умолчанию для запуска приложения
CMD ["yarn", "start:dev"]