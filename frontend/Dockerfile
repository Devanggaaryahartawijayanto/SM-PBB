# Menggunakan image Node.js standar
FROM node:18-alpine

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Menyalin file package management dan menginstal dependensi
# Ini dilakukan terpisah untuk memanfaatkan cache Docker
COPY package.json package-lock.json* ./
RUN npm install

# Menyalin sisa kode aplikasi
COPY . .

# Memberi tahu Docker bahwa container akan menggunakan port 3000
EXPOSE 3000

# Perintah untuk menjalankan server development Next.js
CMD ["npm", "run", "dev"]