# Gunakan Node.js versi terbaru sebagai base image
FROM node:18

# Set direktori kerja di dalam container
WORKDIR /app

# Copy file package.json dan package-lock.json
COPY package*.json ./

# Install Velero CLI (adjust version if needed)
RUN curl -LO https://github.com/vmware-tanzu/velero/releases/download/v1.15.2/velero-linux-amd64.tar.gz && \
    tar -xzf velero-linux-amd64.tar.gz && \
    mv velero /usr/local/bin && \
    rm velero-linux-amd64.tar.gz 

# Install dependencies
RUN npm install

# Copy semua file ke dalam container
COPY . .

# Ekspos port yang digunakan oleh Express.js
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "index.js"]
