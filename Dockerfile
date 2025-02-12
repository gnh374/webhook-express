
# Gunakan Node.js versi terbaru sebagai base image

FROM node:18


# Set direktori kerja di dalam container
WORKDIR /app

# Copy file package.json dan package-lock.json
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy semua file ke dalam container
COPY . .

# Ekspos port yang digunakan oleh Express.js
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "index.js"]
