import { navigateToUrl } from '../../../routes/routes.js';

class ArticleDetailPresenter {
    constructor(view) {
        this._view = view;
        this._articles = {
            blackheads: {
                title: "Blackheads (Komedo Hitam)",
                img: "/images/artikel/blackheads.jpg",
                content: "Blackheads adalah tonjolan kecil berwarna hitam karena pori-pori terbuka yang tersumbat minyak dan sel kulit mati. Umumnya muncul di wajah, dada, punggung, leher, dan bahu. Tidak terasa sakit saat disentuh.",
                ciri: [
                    "Tonjolan kecil berwarna hitam karena pori-pori terbuka",
                    "Umumnya muncul di wajah, dada, punggung, leher, dan bahu",
                    "Tidak terasa sakit saat disentuh",
                ],
                penyebab: [
                    "Penumpukan minyak dan sel kulit mati",
                    "Produksi sebum berlebih",
                    "Bakteri Propionibacterium acnes",
                    "Perubahan hormon (pubertas, menstruasi, penggunaan pil KB)",
                    "Pola makan tinggi gula dan produk susu",
                ],
                penanganan: [
                    "Asam salisilat: Mengelupas sel kulit mati dan membuka pori-pori",
                    "Retinoid topikal: Mempercepat regenerasi sel",
                    "Chemical peeling: Menggunakan bahan kimia untuk eksfoliasi",
                    "Terapi laser: Mengurangi produksi minyak dan bakteri",
                ],
                pencegahan: [
                    "Cuci wajah dua kali sehari dengan pembersih ringan",
                    "Gunakan produk non-comedogenic",
                    "Hindari menyentuh wajah secara berlebihan",
                    "Eksfoliasi ringan 1–2 kali seminggu",
                    "Kurangi konsumsi makanan tinggi gula dan susu",
                ],
            },
            whiteheads: {
                title: "Whiteheads (Komedo Putih)",
                img: "/images/artikel/whiteheads.jpg",
                content: "Whiteheads adalah bintik kecil berwarna putih akibat pori-pori tersumbat tetapi tertutup oleh lapisan kulit. Berbeda dengan blackheads, komedo putih tidak terpapar udara sehingga tetap berwarna putih.",
                ciri: [
                    "Bintik kecil berwarna putih",
                    "Pori-pori tersumbat tetapi tertutup lapisan kulit",
                    "Tidak terasa sakit dan tidak meradang",
                ],
                penyebab: [
                    "Produksi sebum dan penumpukan sel kulit mati",
                    "Perubahan hormon",
                    "Penggunaan produk yang tidak cocok dengan kulit",
                ],
                penanganan: [
                    "Asam salisilat: Membersihkan pori-pori",
                    "Retinoid ringan: Mengatur siklus pergantian sel kulit",
                    "Rutin membersihkan wajah: Hindari memencet komedo",
                ],
                pencegahan: [
                    "Pilih produk skincare dengan label non-comedogenic",
                    "Jaga kebersihan wajah dan rambut",
                    "Ganti sarung bantal dan handuk secara rutin",
                    "Hindari produk terlalu berat (terutama yang berbasis minyak)",
                ],
            },
            papula: {
                title: "Papules (Jerawat Papula)",
                img: "/images/artikel/papula.jpg",
                content: "Papules adalah benjolan kecil, merah, padat, tidak mengandung nanah. Kulit terasa meradang dan kasar saat disentuh. Jenis jerawat ini menunjukkan adanya peradangan pada pori-pori yang tersumbat.",
                ciri: [
                    "Benjolan kecil, merah, dan padat",
                    "Tidak mengandung nanah",
                    "Kulit terasa meradang dan kasar",
                    "Nyeri saat disentuh",
                ],
                penyebab: [
                    "Perubahan hormon",
                    "Infeksi bakteri P. acnes",
                    "Produksi minyak berlebih",
                    "Pemakaian kosmetik berat dan pola makan buruk",
                ],
                penanganan: [
                    "Pembersih wajah lembut: Menghindari iritasi",
                    "Asam salisilat, benzoil peroksida, sulfur: Mengurangi peradangan",
                    "Antibiotik topikal atau oral: Jika peradangan parah",
                    "Hindari memencet jerawat",
                ],
                pencegahan: [
                    "Gunakan skincare ringan dan tidak menyumbat pori",
                    "Hindari makanan pemicu (gula, makanan cepat saji)",
                    "Jangan sering menyentuh atau memencet wajah",
                    "Bersihkan wajah sebelum dan sesudah aktivitas berat",
                ],
            },
            pustula: {
                title: "Pustules (Jerawat Pustula)",
                img: "/images/artikel/pustula.jpg",
                content: "Pustules adalah benjolan merah dengan titik putih di tengah yang berisi nanah. Nyeri saat disentuh dan mudah pecah jika tidak ditangani dengan benar. Merupakan tahap lanjut dari papula yang terinfeksi.",
                ciri: [
                    "Benjolan merah dengan titik putih di tengah",
                    "Berisi nanah",
                    "Nyeri saat disentuh",
                    "Mudah pecah jika dipencet",
                ],
                penyebab: [
                    "Kombinasi minyak berlebih, sel kulit mati, dan bakteri",
                    "Pengaruh hormonal",
                    "Kosmetik berat, stres, dan faktor genetik",
                    "Kebiasaan merokok",
                ],
                penanganan: [
                    "Asam salisilat & benzoil peroksida: Mengurangi sumbatan dan bakteri",
                    "Retinoid & antibiotik topikal: Menenangkan peradangan",
                    "Antibiotik oral / isotretinoin: Untuk kasus parah",
                    "Fototerapi: Menggunakan cahaya untuk membunuh bakteri",
                ],
                pencegahan: [
                    "Rutin cuci muka dan lakukan double cleansing",
                    "Gunakan sunscreen non-komedogenik",
                    "Hindari produk yang terlalu oklusif (menyumbat pori)",
                    "Jaga pola makan dan tidur yang teratur",
                ],
            },
            kistik: {
                title: "Cystic Acne (Jerawat Kistik)",
                img: "/images/artikel/kistik.jpg",
                content: "Cystic acne adalah benjolan besar, merah, dalam, terasa nyeri, dan berisi nanah. Merupakan jenis jerawat paling parah yang terbentuk jauh di bawah permukaan kulit dan sering meninggalkan bekas luka permanen.",
                ciri: [
                    "Benjolan besar, merah, dan dalam",
                    "Terasa sangat nyeri",
                    "Berisi nanah",
                    "Sering meninggalkan bekas luka",
                ],
                penyebab: [
                    "Produksi minyak berlebih yang menyumbat jaringan kulit dalam",
                    "Perubahan hormon yang ekstrem",
                    "Kosmetik berat dan tidak cocok",
                    "Faktor genetik, stres, dan obat-obatan tertentu",
                ],
                penanganan: [
                    "Antibiotik oral: Mengurangi bakteri dan inflamasi",
                    "Retinoid topikal: Mengatur regenerasi kulit",
                    "Isotretinoin oral: Obat kuat untuk jerawat parah (resep dokter)",
                    "Suntik kortikosteroid: Mengempiskan jerawat besar dengan cepat",
                ],
                pencegahan: [
                    "Hindari penggunaan produk wajah berat dan berminyak",
                    "Rutin konsultasi dengan dermatologis jika ada riwayat keluarga",
                    "Kelola stres dengan baik (olahraga, meditasi, tidur cukup)",
                    "Hindari memencet jerawat kistik karena bisa memperburuk luka",
                ],
            },
        };
    }

    async init() {
        try {
            const articleSlug = this._extractArticleSlugFromUrl();
            if (!articleSlug) {
                this._showErrorMessage("Could not parse article ID from URL");
                return;
            }

            const article = this._articles[articleSlug];
            if (!article) {
                this._showErrorMessage("Artikel tidak ditemukan");
                return;
            }

            this._renderArticle(article);
            this._setupEventListeners();
        } catch (error) {
            console.error("Error initializing article detail:", error);
            this._showErrorMessage("Terjadi kesalahan saat memuat artikel");
        }
    }

    _extractArticleSlugFromUrl() {
        const url = window.location.hash;
        const queryString = url.split('?')[1];
        if (!queryString) return null;

        const params = new URLSearchParams(queryString);
        return params.get('slug');
    }

    _showErrorMessage(message) {
        this._view.querySelector("#error-template").classList.remove("hidden");
        this._view.querySelector("#error-message").textContent = message;
        this._view.querySelector("#article-template").classList.add("hidden");

        const backButton = this._view.querySelector("#back-to-articles");
        if (backButton) {
            backButton.addEventListener("click", () => {
                window.location.hash = "#/artikel";
            });
        }
    }

    _renderArticle(article) {
        this._view.querySelector("#error-template").classList.add("hidden");
        this._view.querySelector("#article-template").classList.remove("hidden");

        // Set article data
        this._view.querySelector("#article-title").textContent = article.title;
        this._view.querySelector("#article-image").src = article.img;
        this._view.querySelector("#article-image").alt = article.title;
        this._view.querySelector("#article-content").textContent = article.content;

        // Render lists
        this._renderList("#characteristics-list", article.ciri);
        this._renderList("#causes-list", article.penyebab);
        this._renderList("#treatment-list", article.penanganan);
        this._renderList("#prevention-list", article.pencegahan);
    }

    _renderList(selector, items) {
        const listElement = this._view.querySelector(selector);
        listElement.innerHTML = items.map(item => `<li>${item}</li>`).join("");
    }

    _setupEventListeners() {
        const backButton = this._view.querySelector("#back-to-articles-list");
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToUrl('/article');
            });
        }

        const allArticlesButton = this._view.querySelector("#all-articles-button");
        if (allArticlesButton) {
            allArticlesButton.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToUrl('/article');
            });
        }

        const dashboardButton = this._view.querySelector("#dashboard-button");
        dashboardButton?.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.hash = "#/dashboard";
        });
    }
}

export default ArticleDetailPresenter;