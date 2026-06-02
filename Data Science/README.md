# FinTrack - DS

## 📌 Project Overview

FinTrack merupakan platform manajemen keuangan yang membantu pengguna memantau dan mengelola transaksi keuangan pribadi maupun bisnis. Dalam proyek ini, tim Data Science berperan melakukan data preprocessing, feature engineering, dan exploratory data analysis (EDA) untuk mengubah data transaksi mentah menjadi dataset yang berkualitas serta menghasilkan insight yang mendukung pengambilan keputusan berbasis data.

---

## 📂 Dataset

Dataset yang digunakan terdiri dari dua jenis data:

### 1. Personal Finance Dataset

Berisi riwayat transaksi keuangan pribadi dengan atribut:

* transaction_id
* transaction_date
* description
* category
* transaction_type
* amount
* payment_method

### 2. Business Finance Dataset

Berisi riwayat transaksi keuangan bisnis dengan atribut:
* transaction_id
* transaction_date
* description
* category
* transaction_type
* amount
* payment_method


Dataset  mengandung berbagai bentuk *noise* seperti:

* Missing values
* Duplicate records
* Inconsistent values
* Invalid transaction amounts

---

## 🧹 Data Preprocessing

Sebelum dilakukan analisis, dataset personal finance dan business finance melalui proses data cleaning untuk meningkatkan kualitas data dan mengatasi berbagai permasalahan seperti missing values, data duplikat, serta outlier.

### Data Assessing

Hasil pemeriksaan awal menunjukkan:

* Personal Finance Dataset: 3.675 baris dan 7 kolom
* Business Finance Dataset: 3.150 baris dan 7 kolom
* Terdapat missing values pada seluruh atribut utama
* Ditemukan 165 data duplikat pada dataset personal
* Ditemukan 130 data duplikat pada dataset bisnis
* Variabel `transaction_date` masih bertipe object dan belum dikonversi ke datetime
* Ditemukan outlier berupa nilai transaksi negatif pada kolom `amount`

### Data Cleaning

Tahapan pembersihan data yang dilakukan meliputi:

1. Menghapus data duplikat menggunakan `drop_duplicates()`.
2. Mengisi missing value pada `transaction_id` dengan ID unik baru.
3. Menghapus baris yang memiliki missing value pada `category`.
4. Mengisi missing value pada `description` menggunakan nilai dari `category`.
5. Mengisi missing value pada `transaction_type` berdasarkan mapping kategori transaksi.
6. Mengubah nilai negatif pada kolom `amount` menjadi positif menggunakan fungsi `abs()`.
7. Mengisi missing value pada `amount` menggunakan median dari masing-masing kategori transaksi.
8. Menghapus missing value pada `transaction_date`.
9. Mengubah tipe data `transaction_date` dari object menjadi datetime.

### Data Dictionary

| Kolom            | Tipe Data | Deskripsi                               |
| ---------------- | --------- | --------------------------------------- |
| transaction_id   | Float     | Identifikasi unik transaksi             |
| transaction_date | Datetime  | Tanggal transaksi                       |
| description      | Object    | Deskripsi transaksi                     |
| category         | Object    | Kategori transaksi                      |
| transaction_type | Object    | Jenis transaksi (Pemasukan/Pengeluaran) |
| amount           | Float     | Nominal transaksi                       |
| payment_method   | Object    | Metode pembayaran                       |

---

## 📊 Exploratory Data Analysis (EDA)

Tahap Exploratory Data Analysis (EDA) dilakukan untuk memahami karakteristik data, pola transaksi, serta menghasilkan insight yang dapat menjawab pertanyaan bisnis yang telah ditetapkan.

### Analisis Distribusi Data

* Membuat bar chart untuk melihat distribusi variabel kategorikal:

  * description
  * category
  * transaction_type
  * payment_method

* Membuat histogram dan boxplot untuk menganalisis distribusi variabel numerik `amount`.

* Melakukan transformasi logaritmik pada kolom `amount` untuk mengurangi skewness dan menyeimbangkan distribusi data.

### Analisis Korelasi

* Melakukan label encoding pada variabel kategorikal.
* Membuat heatmap korelasi untuk melihat hubungan antar fitur.

### Analisis Time Series

* Mengekstraksi informasi bulan dan tahun dari `transaction_date`.
* Membentuk variabel `month` untuk analisis tren bulanan.
* Menggunakan `groupby()` untuk menghitung total pemasukan dan pengeluaran per bulan.

### Analisis Rasio Pengeluaran

* Membentuk fitur `rasio_pengeluaran` sebagai perbandingan antara total pengeluaran dan total pemasukan bulanan.
* Digunakan untuk mengevaluasi apakah pengguna mampu menjaga pengeluaran tetap di bawah 80% dari pemasukan.

### Analisis Pengeluaran Bisnis

* Mengelompokkan data berdasarkan `category`, `transaction_type`, dan `month`.
* Mengidentifikasi kategori pengeluaran terbesar setiap bulan.
* Menentukan kategori biaya yang paling memengaruhi profitabilitas bisnis.

---

## ❓ Business Questions

### Personal Finance

1. Apakah pengguna mampu menjaga pengeluaran pribadi tetap di bawah 80% dari total pemasukan setiap bulan selama dua tahun terakhir?

### Business Finance

2. Bagaimana kondisi arus kas bisnis selama dua tahun terakhir?

3. Kategori biaya bisnis apa yang paling besar mengurangi keuntungan bulanan?

---

### Insight Utama

#### Personal Finance

* Rasio pengeluaran berada pada kisaran 5%–20% dari total pemasukan bulanan.
* Pengguna berhasil menjaga pengeluaran tetap berada di bawah batas ideal 80%.
* Kondisi keuangan pribadi tergolong sehat dan terkendali.

#### Business Finance

* Pemasukan bisnis secara konsisten lebih tinggi dibandingkan pengeluaran.
* Arus kas bisnis menunjukkan kondisi yang stabil dan positif.
* Kategori pengeluaran terbesar yang paling memengaruhi keuntungan adalah:

  * Gaji & Karyawan
  * Pembelian Stok
  * Pajak & Perizinan

---

## 🛠️ Technologies Used

* Python
* Pandas
* NumPy
* Matplotlib
* Seaborn
* Jupyter Notebook

---

## 🚀 How to Run

Clone repository:

```bash
git clone https://github.com/FinTrack-webs/capstone-fintrack.git
```

Masuk ke folder project:

```bash
cd capstone-fintrack
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Jalankan notebook:

```bash
jupyter notebook
```

Buka file:

```text
Data Science/Preprocessing.ipynb
```
## SETUP VIRTUAL ENVIORMENT

```
cd capstone project
py -m venv .env
.env\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Menjalankan Streamlit

```
streamlit run dashboard/dashboard.py
```

---

## 👥 Team

FinTrack Capstone Project

Data preprocessing, exploratory data analysis, dan business insight generation untuk mendukung pengambilan keputusan berbasis data pada domain keuangan pribadi dan bisnis.
