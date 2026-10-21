from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import text
from database import engine
from werkzeug.security import generate_password_hash, check_password_hash
import os
import numpy as np
import secrets
import hashlib
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask_mail import Mail, Message

load_dotenv()

from dendrogram import buat_dendrogram

app = Flask(__name__)

# Konfigurasi email untuk fitur lupa password
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

CORS(app)

# Membuat folder static jika belum ada
os.makedirs("static", exist_ok=True)
# ==========================================
# API : LOGIN USER DENGAN HASHING PASSWORD
# ==========================================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}

        username = data.get("username")
        password = data.get("password")

        if not isinstance(username, str) or not isinstance(password, str):
            return jsonify({
                "status": "error",
                "message": "Username dan password wajib diisi."
            }), 400

        if not username.strip() or not password:
            return jsonify({
                "status": "error",
                "message": "Username dan password wajib diisi."
            }), 400

        print("========== PROSES LOGIN ==========")
        print("USERNAME :", username)

        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT id, username, password
                    FROM users
                    WHERE username = :username
                    LIMIT 1
                """),
                {"username": username}
            )

            user = result.fetchone()

            if not user:
                return jsonify({
                    "status": "error",
                    "message": "Username atau password salah."
                }), 401

            stored_password = user.password

            # Periksa apakah password sudah berbentuk hash.
            is_hash = (
                isinstance(stored_password, str)
                and stored_password.startswith(
                    ("scrypt:", "pbkdf2:")
                )
            )

            if is_hash:
                # Password sudah di-hash: verifikasi hash.
                password_valid = check_password_hash(
                    stored_password, password
                )

            else:
                # Migrasi sementara akun lama yang masih
                # menyimpan password dalam teks biasa.
                password_valid = (
                    isinstance(stored_password, str)
                    and stored_password == password
                )

                if password_valid:
                    new_hash = generate_password_hash(password)

                    conn.execute(
                        text("""
                            UPDATE users
                            SET password = :password
                            WHERE id = :id
                        """),
                        {
                            "password": new_hash,
                            "id": user.id
                        }
                    )
                    conn.commit()

            if not password_valid:
                return jsonify({
                    "status": "error",
                    "message": "Username atau password salah."
                }), 401

            return jsonify({
                "status": "success",
                "message": "Login berhasil.",
                "user": {
                    "id": user.id,
                    "username": user.username
                }
            })

    except Exception:
        app.logger.exception("Terjadi kesalahan saat login.")

        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan pada server."
        }), 500
# ==========================================
# API : AMBIL SEMUA DATA SISWA
# ==========================================
@app.route("/siswa", methods=["GET"])
def get_siswa():

    try:

        with engine.connect() as conn:

            result = conn.execute(text("""
SELECT *
FROM siswa
ORDER BY id ASC
"""))

            data = []

            for row in result:

                data.append(dict(row._mapping))

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==========================================
# API : TAMBAH DATA SISWA
# ==========================================
@app.route("/siswa", methods=["POST"])
def tambah_siswa():

    try:

        data = request.json
        print("DATA MASUK MYSQL :", data["nama"])

        with engine.connect() as conn:

            conn.execute(text("""
                INSERT INTO siswa
                (
                    nama,
                    kelas,
                    agama,
                    ppkn,
                    indonesia,
                    matematika,
                    pjok,
                    seni,
                    mulok,
                    ipas,
                    inggris
                )
                VALUES
                (
                    :nama,
                    :kelas,
                    :agama,
                    :ppkn,
                    :indonesia,
                    :matematika,
                    :pjok,
                    :seni,
                    :mulok,
                    :ipas,
                    :inggris
                )
            """), data)

            conn.commit()

        return jsonify({
            "status": "success",
            "message": "Data berhasil disimpan"
        })

    except Exception as e:
        print("ERROR MYSQL :", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# ==========================================
# API : HAPUS DATA SISWA
# ==========================================
@app.route("/siswa/<int:id>", methods=["DELETE"])
def hapus_siswa(id):

    try:

        with engine.connect() as conn:

            result = conn.execute(
                text("SELECT * FROM siswa WHERE id = :id"),
                {"id": id}
            )

            siswa = result.fetchone()

            if siswa:

                conn.execute(
                    text("DELETE FROM siswa WHERE id = :id"),
                    {"id": id}
                )

                conn.commit()

                return jsonify({
                    "status": "success",
                    "message": "Data berhasil dihapus"
                })

            return jsonify({
                "status": "error",
                "message": "Data tidak ditemukan"
            }), 404

    except Exception as e:

        print("ERROR HAPUS :", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# ==========================================
# IMPORT EXCEL KE MYSQL
# ==========================================

@app.route("/import-excel", methods=["POST"])
def import_excel():

    try:

        data = request.json
        print("jumlah data:",len(data))
        print(data)

        with engine.connect() as conn:

            # Hapus seluruh data lama agar urutan sama dengan Excel
            conn.execute(text("DELETE FROM siswa"))

            for s in data:

                conn.execute(text("""
                    INSERT INTO siswa
                    (
                        nama,
                        kelas,
                        agama,
                        ppkn,
                        indonesia,
                        matematika,
                        pjok,
                        seni,
                        mulok,
                        ipas,
                        inggris
                        
                    )
                   VALUES
                    (
                        :nama,
                        :kelas,
                        :agama,
                        :ppkn,
                        :indonesia,
                        :matematika,
                        :pjok,
                        :seni,
                        :mulok,
                        :ipas,
                        :inggris
                    )
                """), s)

            conn.commit()

        return jsonify({
            "status": "success"
        })

    except Exception as e:
        print("EROR IMPORT :", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# ==========================================
# API : GENERATE DENDROGRAM
# ==========================================
@app.route("/generate-dendrogram", methods=["POST"])
def generate_dendrogram():

    data = request.get_json()

    siswa = data["siswa"]
    cluster = int(data["cluster"])

    # nama file yang dikirim dari Angular
    filename = data["filename"]

    nama = []
    nilai = []

    for s in siswa:

        nama.append(s["nama"])

        nilai.append([
            float(s["agama"]),
            float(s["ppkn"]),
            float(s["indonesia"]),
            float(s["matematika"]),
            float(s["pjok"]),
            float(s["seni"]),
            float(s["mulok"]),
            float(s["ipas"]),
            float(s["inggris"])
        ])

    nilai = np.array(nilai)

    buat_dendrogram(
        nilai,
        nama,
        cluster,
        filename
    )

    return jsonify({
        "status": "success",
        "image": f"http://127.0.0.1:5000/static/{filename}"
    })
# ==========================================
# SAVE HISTORY
# ==========================================
@app.route("/save-history", methods=["POST"])
def save_history():

    try:

        data = request.json

        with engine.connect() as conn:

            result = conn.execute(text("""
                INSERT INTO clustering_history
                (
                    tahun_ajaran,
                    semester,
                    kelas,
                    jumlah_cluster,
                    linkage,
                    silhouette,
                    dbi,
                    chi,
                    dendrogram,
                    euclidean_matrix,
                    nama_siswa
                )
                VALUES
                (
                    :tahun_ajaran,
                    :semester,
                    :kelas,
                    :jumlah_cluster,
                    :linkage,
                    :silhouette,
                    :dbi,
                    :chi,
                    :dendrogram,
                    :euclidean_matrix,
                    :nama_siswa
                )
            """), data)

            conn.commit()
            history_id = conn.execute(
                text("SELECT LAST_INSERT_ID()")
                ).scalar()
            history_id = result.lastrowid

            return jsonify({
            "status": "success",
            "history_id": history_id,
        })

    except Exception as e:

        print("ERROR HISTORY :", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# ==========================================
# UPDATE DENDROGRAM
# ==========================================
@app.route("/update-dendrogram", methods=["POST"])
def update_dendrogram():

    try:

        data = request.json

        with engine.connect() as conn:

            conn.execute(text("""
                UPDATE clustering_history
                SET dendrogram = :dendrogram
                WHERE id = :history_id
            """), data)

            conn.commit()

        return jsonify({
            "status": "success"
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }),500
# ==========================================
# API : SIMPAN DETAIL CLUSTER
# ==========================================
@app.route("/save-detail", methods=["POST"])
def save_detail():

    try:

        data = request.json
        print("========== DETAIL MASUK ==========")
        print(data)

        with engine.connect() as conn:

            for item in data:
                print(item)
                conn.execute(text("""

                    INSERT INTO clustering_detail
                    (
                        history_id,
                        nama,
                        kelas,
                        cluster
                    )
                    VALUES
                    (
                        :history_id,
                        :nama,
                        :kelas,
                        :cluster
                    )
                """), item)

            conn.commit()

        return jsonify({
            "status": "success"
        })

    except Exception as e:

        print("ERROR DETAIL :", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# ==========================================
# API : AMBIL SEMUA RIWAYAT
# ==========================================
@app.route("/history", methods=["GET"])
def get_history():

    try:

        with engine.connect() as conn:

            result = conn.execute(text("""
                SELECT *
                FROM clustering_history
                ORDER BY tanggal_proses DESC
            """))

            data = []

            for row in result:

                item = dict(row._mapping)

                # Ubah tanggal menjadi teks agar Angular
                # tidak menggeser waktu berdasarkan timezone
                if item.get("tanggal_proses"):

                    item["tanggal_proses"] = (
                        item["tanggal_proses"]
                        .strftime("%Y-%m-%d %H:%M:%S")
                    )

                data.append(item)

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# ==========================================
# API : DETAIL RIWAYAT CLUSTERING
# ==========================================
@app.route("/history/<int:history_id>", methods=["GET"])
def get_history_detail(history_id):

    try:

        with engine.connect() as conn:

            # Detail anggota cluster
            detail = conn.execute(text("""
                SELECT *
                FROM clustering_detail
                WHERE history_id = :id
                ORDER BY cluster, nama
            """), {"id": history_id}).fetchall()

            # Data history
            history = conn.execute(text("""
                SELECT
                    euclidean_matrix,
                    nama_siswa,
                    dendrogram
                FROM clustering_history
                WHERE id = :id
            """), {"id": history_id}).fetchone()

            return jsonify({

                "detail": [dict(row._mapping) for row in detail],

                "euclidean_matrix": history.euclidean_matrix,

                "nama_siswa": history.nama_siswa,

                "dendrogram": history.dendrogram

            })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# ==========================================
# API : HAPUS RIWAYAT CLUSTERING
# ==========================================
@app.route("/history/<int:history_id>", methods=["DELETE"])
def hapus_history(history_id):

    try:

        with engine.connect() as conn:

            # Hapus detail terlebih dahulu
            conn.execute(
                text("""
                    DELETE FROM clustering_detail
                    WHERE history_id = :id
                """),
                {"id": history_id}
            )

            # Hapus history
            conn.execute(
                text("""
                    DELETE FROM clustering_history
                    WHERE id = :id
                """),
                {"id": history_id}
            )

            conn.commit()

        return jsonify({
            "status": "success"
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# ==========================================
# API : LUPA PASSWORD
# ==========================================
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json(silent=True) or {}
        email = data.get("email")

        if not isinstance(email, str) or not email.strip():
            return jsonify({
                "status": "error",
                "message": "Alamat email wajib diisi."
            }), 400

        email = email.strip().lower()

        # Pesan dibuat sama agar tidak membocorkan
        # apakah sebuah email terdaftar.
        pesan = (
            "Jika email terdaftar, tautan reset password "
            "akan dikirim ke email tersebut."
        )

        with engine.connect() as conn:
            user = conn.execute(
                text("""
                    SELECT id, email
                    FROM users
                    WHERE LOWER(email) = :email
                    LIMIT 1
                """),
                {"email": email}
            ).fetchone()

        if not user:
            return jsonify({
                "status": "success",
                "message": pesan
            }), 200

        # Buat token acak dan simpan hanya hash-nya.
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(
            token.encode("utf-8")
        ).hexdigest()

        expiry = datetime.utcnow() + timedelta(minutes=15)

        with engine.begin() as conn:
            conn.execute(
                text("""
                    UPDATE users
                    SET reset_token_hash = :token_hash,
                        reset_token_expiry = :expiry
                    WHERE id = :id
                """),
                {
                    "token_hash": token_hash,
                    "expiry": expiry,
                    "id": user.id
                }
            )

        reset_url = os.getenv(
            "RESET_PASSWORD_URL",
            "http://localhost:8101/reset-password"
        )

        separator = "&" if "?" in reset_url else "?"
        link = f"{reset_url}{separator}token={token}"

        try:
            message = Message(
                subject="Reset Password CP-Insight",
                recipients=[email],
                body=(
                    "Halo,\n\n"
                    "Kami menerima permintaan reset password "
                    "akun CP-Insight.\n\n"
                    f"Buka tautan berikut untuk membuat password baru:\n"
                    f"{link}\n\n"
                    "Tautan berlaku selama 15 menit dan hanya "
                    "dapat digunakan satu kali.\n\n"
                    "Jika kamu tidak meminta reset password, "
                    "abaikan email ini."
                )
            )
            mail.send(message)

        except Exception:
            app.logger.exception("Gagal mengirim email reset.")

            # Batalkan token jika email gagal dikirim.
            with engine.begin() as conn:
                conn.execute(
                    text("""
                        UPDATE users
                        SET reset_token_hash = NULL,
                            reset_token_expiry = NULL
                        WHERE id = :id
                    """),
                    {"id": user.id}
                )

            return jsonify({
                "status": "error",
                "message": "Email reset gagal dikirim. Periksa konfigurasi email."
            }), 500

        return jsonify({
            "status": "success",
            "message": pesan
        }), 200

    except Exception:
        app.logger.exception("Kesalahan pada lupa password.")

        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan pada server."
        }), 500


# ==========================================
# API : RESET PASSWORD BARU
# ==========================================
@app.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json(silent=True) or {}

        token = data.get("token")
        password_baru = data.get("password")

        if not isinstance(token, str) or not token:
            return jsonify({
                "status": "error",
                "message": "Token reset tidak valid."
            }), 400

        if not isinstance(password_baru, str) or len(password_baru) < 8:
            return jsonify({
                "status": "error",
                "message": "Password baru minimal 8 karakter."
            }), 400

        token_hash = hashlib.sha256(
            token.encode("utf-8")
        ).hexdigest()

        password_hash = generate_password_hash(password_baru)

        with engine.begin() as conn:
            user = conn.execute(
                text("""
                    SELECT id, reset_token_expiry
                    FROM users
                    WHERE reset_token_hash = :token_hash
                    LIMIT 1
                """),
                {"token_hash": token_hash}
            ).fetchone()

            if not user or not user.reset_token_expiry:
                return jsonify({
                    "status": "error",
                    "message": "Token tidak valid atau sudah digunakan."
                }), 400

            expiry = user.reset_token_expiry

            if expiry <= datetime.utcnow():
                conn.execute(
                    text("""
                        UPDATE users
                        SET reset_token_hash = NULL,
                            reset_token_expiry = NULL
                        WHERE id = :id
                    """),
                    {"id": user.id}
                )

                return jsonify({
                    "status": "error",
                    "message": "Token sudah kedaluwarsa. Silakan minta tautan baru."
                }), 400

            conn.execute(
                text("""
                    UPDATE users
                    SET password = :password,
                        reset_token_hash = NULL,
                        reset_token_expiry = NULL
                    WHERE id = :id
                """),
                {
                    "password": password_hash,
                    "id": user.id
                }
            )

        return jsonify({
            "status": "success",
            "message": "Password berhasil diubah. Silakan login kembali."
        }), 200

    except Exception:
        app.logger.exception("Kesalahan saat reset password.")

        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan pada server."
        }), 500
# ==========================================
# MENJALANKAN FLASK
# ==========================================
print(app.url_map)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
