class ArticlePresenter {
    constructor(view) {
        this._view = view;
        this._articles = [
            {
                slug: "blackheads",
                imageUrl: "/images/artikel/blackheads.jpg",
                title: "Jerawat Blackheads (Komedo Hitam)",
                description: "Blackheads atau komedo hitam adalah pori-pori yang tersumbat oleh minyak dan sel kulit mati yang terpapar udara sehingga berubah warna menjadi hitam. Jenis jerawat ini umumnya muncul di area T-zone wajah seperti hidung, dahi, dan dagu. Meskipun tidak menimbulkan peradangan, blackheads dapat mempengaruhi penampilan kulit."
            },
            {
                slug: "whiteheads",
                imageUrl: "/images/artikel/whiteheads.jpg",
                title: "Jerawat Whiteheads (Komedo Putih)",
                description: "Whiteheads atau komedo putih adalah pori-pori yang tersumbat oleh minyak dan sel kulit mati yang tertutup lapisan kulit, sehingga tampak sebagai benjolan kecil berwarna putih. Berbeda dengan blackheads, whiteheads tidak terpapar udara sehingga tetap berwarna putih atau flesh-tone. Jenis jerawat ini sering muncul di area pipi dan dahi."
            },
            {
                slug: "papula",
                imageUrl: "/images/artikel/papula.jpg",
                title: "Jerawat Papula",
                description: "Papula adalah jenis jerawat yang meradang, terasa sakit saat disentuh, dan terlihat kemerahan tanpa nanah di permukaan kulit. Papula terbentuk ketika dinding folikel rambut pecah akibat peradangan, menyebabkan bakteri menyebar ke jaringan kulit sekitarnya. Jenis jerawat ini tidak boleh dipencet karena dapat memperparah peradangan."
            },
            {
                slug: "pustula",
                imageUrl: "/images/artikel/pustula.jpg",
                title: "Jerawat Pustula",
                description: "Pustula adalah jerawat yang berisi nanah di tengahnya, berwarna putih atau kuning, dan dikelilingi oleh peradangan kemerahan. Berbeda dengan papula, pustula memiliki 'mata' putih di tengahnya yang berisi nanah. Jenis jerawat ini terbentuk ketika sel darah putih berkumpul untuk melawan infeksi bakteri di dalam pori-pori yang tersumbat."
            },
            {
                slug: "kistik",
                imageUrl: "/images/artikel/kistik.jpg",
                title: "Jerawat Kistik (Cystic Acne)",
                description: "Jerawat kistik adalah jenis jerawat parah yang terbentuk jauh di bawah permukaan kulit. Berisi nanah, terasa nyeri, dan berisiko meninggalkan bekas luka permanen. Jerawat kistik memerlukan penanganan khusus dari dermatologis karena dapat menyebabkan kerusakan jaringan kulit yang serius. Jenis jerawat ini sering dikaitkan dengan faktor hormonal dan genetik."
            }
        ];
    }

    async init() {
        this._renderArticles();
        this._setupEventListeners();
    }

    _renderArticles() {
        const container = this._view.querySelector('#articles-container');
        if (container) {
            container.innerHTML = this._articles.map(article =>
                this._renderArticleCard(article.slug, article.imageUrl, article.title, article.description)
            ).join('');
        }
    }

    _renderArticleCard(slug, imageUrl, title, description) {
        return `
        <article data-slug="${slug}" class="artikel-card cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="md:flex">
            <div class="md:w-2/5">
            <img src="${imageUrl}" alt="${title}" class="w-full h-64 object-cover" />
            </div>
            <div class="md:w-3/5 p-8">
                <div class="flex items-center mb-4">
                <div class="w-2 h-8 bg-[#00667A] rounded-full mr-4"></div>
                <h3 class="text-2xl font-bold text-[#00667A]">${title}</h3>
                </div>
                <p class="text-gray-700 leading-7 text-justify mb-6">${description}</p>
                <div class="flex items-center text-[#009CA6] font-semibold hover:text-[#00667A] transition-colors">
                <span class="mr-2">Baca selengkapnya</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                </div>
            </div>
            </div>
        </article>
    `;
    }

    _setupEventListeners() {
        const backButton = this._view.querySelector("#back-button");
        if (backButton) {
            backButton.addEventListener("click", () => {
                window.location.hash = "#/dashboard";
            });
        }

        // Perbaikan selector dan routing
        this._view.querySelectorAll(".artikel-card").forEach((card) => {
            card.addEventListener("click", () => {
                const slug = card.getAttribute("data-slug");
                window.location.hash = `#/article-detail?slug=${slug}`;
            });
        });
    }

}

export default ArticlePresenter;