# Используем официальный Node.js образ с нужной версией
FROM node:20

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и yarn.lock файлы
#COPY package.json yarn.lock ./

# Копируем код приложения
COPY . .

# Устанавливаем зависимости
RUN yarn

# Поднимаем лимит оперативной памяти
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Собираем Vue приложение для production
RUN yarn build

# Экспозируем порт
EXPOSE 8000

# Команда по умолчанию для запуска приложения
CMD ["yarn", "preview"]