import matplotlib

matplotlib.use("Agg")

import numpy as np
import matplotlib.pyplot as plt

from scipy.cluster.hierarchy import (
    linkage,
    dendrogram,
    set_link_color_palette,
    fcluster
)

from sklearn.preprocessing import StandardScaler


# ============================================================
# FUNGSI MEMBUAT DENDROGRAM
# ============================================================

def buat_dendrogram(data, nama, cluster, filename):

    # ========================================================
    # 1. UBAH DATA MENJADI ARRAY NUMPY
    # ========================================================

    data = np.array(
        data,
        dtype=float
    )

    # ========================================================
    # 2. STANDARDISASI DATA
    # ========================================================

    scaler = StandardScaler()

    data_scaled = scaler.fit_transform(
        data
    )

    # ========================================================
    # 3. AHC - WARD LINKAGE
    #
    # Ward menggunakan Euclidean Distance
    # ========================================================

    Z = linkage(
        data_scaled,
        method="ward",
        metric="euclidean"
    )

    # ========================================================
    # 4. MEMBENTUK CLUSTER
    # ========================================================

    labels_cluster = fcluster(
        Z,
        cluster,
        criterion="maxclust"
    )

    # ========================================================
    # 5. MENENTUKAN NILAI CUT-OFF
    # ========================================================

    jumlah_data = data.shape[0]

    if (
        cluster > 1
        and cluster < jumlah_data
    ):

        index_bawah = (
            jumlah_data -
            cluster -
            1
        )

        index_atas = (
            jumlah_data -
            cluster
        )

        jarak_bawah = Z[
            index_bawah,
            2
        ]

        jarak_atas = Z[
            index_atas,
            2
        ]

        cut_off = (
            jarak_bawah +
            jarak_atas
        ) / 2

    else:

        cut_off = (
            Z[-1, 2] / 2
        )

    # ========================================================
    # 6. WARNA CABANG DENDROGRAM
    #
    # Warna ini hanya untuk CABANG.
    # Label Cluster tetap hitam.
    # ========================================================

    warna_cluster = [

        "#ff0000",   # Cluster 1 - merah

        "#00aa00",   # Cluster 2 - hijau

        "#0000ff",   # Cluster 3 - biru

        "#ff9800",   # Cluster 4 - orange

        "#9c27b0",   # Cluster 5 - ungu

        "#009688"    # Cluster 6 - teal

    ]

    set_link_color_palette(
        warna_cluster
    )

    # ========================================================
    # 7. BUAT FIGURE
    # ========================================================

    fig, ax = plt.subplots(
        figsize=(18, 9)
    )

    # ========================================================
    # 8. BUAT DENDROGRAM
    # ========================================================

    dendro = dendrogram(

        Z,

        labels=nama,

        leaf_rotation=90,

        leaf_font_size=8,

        color_threshold=cut_off,

        above_threshold_color="#555555",

        ax=ax

    )

    # ========================================================
    # 9. AMBIL URUTAN DAUN / SISWA
    # ========================================================

    leaves = dendro[
        "leaves"
    ]

    # ========================================================
    # 10. POSISI X SETIAP SISWA
    #
    # Scipy dendrogram menggunakan posisi:
    #
    # 5, 15, 25, 35, ...
    # ========================================================

    posisi_siswa = {}

    for i, leaf in enumerate(
        leaves
    ):

        posisi_siswa[
            leaf
        ] = 5 + (
            i * 10
        )

    # ========================================================
    # 11. KELOMPOKKAN POSISI SISWA
    # BERDASARKAN CLUSTER
    # ========================================================

    posisi_cluster = {}

    for leaf in leaves:

        nomor_cluster = int(
            labels_cluster[
                leaf
            ]
        )

        if (
            nomor_cluster
            not in posisi_cluster
        ):

            posisi_cluster[
                nomor_cluster
            ] = []

        posisi_cluster[
            nomor_cluster
        ].append(

            posisi_siswa[
                leaf
            ]

        )

    # ========================================================
    # 12. TRANSFORMASI SUMBU X
    #
    # x tetap mengikuti koordinat dendrogram.
    #
    # y menggunakan posisi relatif terhadap sumbu.
    # ========================================================

    transform = (
        ax.get_xaxis_transform()
    )

    # ========================================================
    # 13. POSISI BRACKET
    #
    # Nilai negatif berarti berada DI BAWAH sumbu X.
    #
    # Nama siswa berada sekitar area 0 sampai -0.15.
    #
    # Kita taruh bracket lebih bawah agar tidak menutupi nama.
    # ========================================================

    y_bracket = -0.30

    # ========================================================
    # 14. POSISI LABEL CLUSTER
    #
    # Label dibuat lebih bawah lagi.
    # ========================================================

    y_label = -0.36

    # ========================================================
    # 15. TINGGI GARIS BRACKET
    # ========================================================

    tinggi_bracket = 0.035

    # ========================================================
    # 16. GAMBAR BRACKET DAN LABEL CLUSTER
    # ========================================================

    for nomor_cluster in sorted(
        posisi_cluster.keys()
    ):

        posisi = posisi_cluster[
            nomor_cluster
        ]

        if not posisi:
            continue

        # ----------------------------------------------------
        # BATAS KIRI CLUSTER
        # ----------------------------------------------------

        x_kiri = (
            min(posisi) - 4
        )

        # ----------------------------------------------------
        # BATAS KANAN CLUSTER
        # ----------------------------------------------------

        x_kanan = (
            max(posisi) + 4
        )

        # ----------------------------------------------------
        # WARNA LABEL DAN BRACKET
        #
        # SEMUANYA HITAM
        # ----------------------------------------------------

        warna_label = "black"

        # ----------------------------------------------------
        # GARIS HORIZONTAL BRACKET
        # ----------------------------------------------------

        ax.plot(

            [
                x_kiri,
                x_kanan
            ],

            [
                y_bracket,
                y_bracket
            ],

            transform=transform,

            color=warna_label,

            linewidth=1.8,

            solid_capstyle="round",

            clip_on=False

        )

        # ----------------------------------------------------
        # GARIS KIRI BRACKET
        # ----------------------------------------------------

        ax.plot(

            [
                x_kiri,
                x_kiri
            ],

            [
                y_bracket,
                y_bracket +
                tinggi_bracket
            ],

            transform=transform,

            color=warna_label,

            linewidth=1.8,

            clip_on=False

        )

        # ----------------------------------------------------
        # GARIS KANAN BRACKET
        # ----------------------------------------------------

        ax.plot(

            [
                x_kanan,
                x_kanan
            ],

            [
                y_bracket,
                y_bracket +
                tinggi_bracket
            ],

            transform=transform,

            color=warna_label,

            linewidth=1.8,

            clip_on=False

        )

        # ----------------------------------------------------
        # LABEL CLUSTER
        # ----------------------------------------------------

        ax.text(

            (
                x_kiri +
                x_kanan
            ) / 2,

            y_label,

            f"Cluster {nomor_cluster}",

            transform=transform,

            ha="center",

            va="center",

            fontsize=10,

            fontweight="bold",

            color="black",

            bbox=dict(

                boxstyle="round,pad=0.25",

                facecolor="white",

                edgecolor="black",

                linewidth=1.2

            ),

            clip_on=False

        )

    # ========================================================
    # 17. GARIS PEMBATAS ANTAR CLUSTER
    # ========================================================

    cluster_urut = sorted(
        posisi_cluster.items()
    )

    for i in range(
        len(cluster_urut) - 1
    ):

        _, posisi_kiri = (
            cluster_urut[i]
        )

        _, posisi_kanan = (
            cluster_urut[i + 1]
        )

        if (
            not posisi_kiri
            or not posisi_kanan
        ):

            continue

        batas_kiri = max(
            posisi_kiri
        )

        batas_kanan = min(
            posisi_kanan
        )

        batas_x = (
            batas_kiri +
            batas_kanan
        ) / 2

        # ----------------------------------------------------
        # GARIS PEMBATAS HITAM
        # ----------------------------------------------------

        ax.axvline(

    x=batas_x,

    color="black",

    linestyle="--",

    linewidth=0.8,

    alpha=0.5,

    ymin=0.0,

    ymax=0.95,

    clip_on=True

)
    # ========================================================
    # 18. GARIS CUT-OFF
    # ========================================================

    ax.axhline(

        y=cut_off,

        color="red",

        linestyle="--",

        linewidth=1.5,

        label=(
            f"Cut-off = "
            f"{cut_off:.2f}"
        )

    )

    # ========================================================
    # 19. LABEL CUT-OFF
    # ========================================================

    ax.text(

        0,

        cut_off,

        (
            f"Cut-off = "
            f"{cut_off:.2f}"
        ),

        color="red",

        fontsize=9,

        fontweight="bold",

        va="bottom",

        ha="left",

        bbox=dict(

            boxstyle="round,pad=0.25",

            facecolor="white",

            edgecolor="red",

            linewidth=1

        )

    )

    # ========================================================
    # 20. JUDUL DENDROGRAM
    # ========================================================

    ax.set_title(

        "Dendrogram Agglomerative Hierarchical Clustering",

        fontsize=14,

        fontweight="bold",

        pad=4

    )

    # ========================================================
    # 21. LABEL SUMBU X
    #
    # labelpad diperbesar agar tidak dekat dengan
    # Cluster 1, Cluster 2, dst.
    # ========================================================

    ax.set_xlabel(

        "Nama Siswa",

        fontsize=11,

        labelpad=8

    )

    # ========================================================
    # 22. LABEL SUMBU Y
    # ========================================================

    ax.set_ylabel(

        "Euclidean Distance",

        fontsize=10

    )

    # ========================================================
    # 23. LEGEND CUT-OFF
    # ========================================================

    ax.legend(

        loc="upper right",

        fontsize=9

    )

    # ========================================================
    # 24. BERIKAN RUANG DI BAGIAN BAWAH
    #
    # Ini penting supaya label cluster yang berada
    # di bawah nama siswa tidak terpotong.
    # ========================================================

    plt.subplots_adjust(

        left=0.05,

        right=0.99,

        top=0.92,

        bottom=0.43

    )

    # ========================================================
    # 25. SIMPAN DENDROGRAM
    # ========================================================

    plt.savefig(

        f"static/{filename}",

        dpi=300,

        bbox_inches="tight",

        pad_inches=0.2

    )

    # ========================================================
    # 26. TUTUP FIGURE
    # ========================================================

    plt.close(fig)

    # ========================================================
    # 27. KEMBALIKAN PALET WARNA
    # ========================================================

    set_link_color_palette(
        None
    )

    # ========================================================
    # 28. KEMBALIKAN HASIL CLUSTER
    # ========================================================

    return labels_cluster