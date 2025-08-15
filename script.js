// Classe principal para gerenciar o catálogo de animes
class AnimeCatalog {
    constructor() {
        this.animes = [];
        this.currentFilter = 'all';
        this.currentSort = 'name';
        this.currentGenre = '';
        this.searchTerm = '';
        this.editingAnimeId = null;
        
        this.init();
    }

    init() {
        this.loadAnimes();
        this.setupEventListeners();
        this.renderAnimes();
        this.updateStats();
        this.updateGenreFilter();
    }

    // Carregar animes do localStorage
    loadAnimes() {
        const saved = localStorage.getItem('animeCatalog');
        this.animes = saved ? JSON.parse(saved) : [];
    }

    // Salvar animes no localStorage
    saveAnimes() {
        localStorage.setItem('animeCatalog', JSON.stringify(this.animes));
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botão adicionar anime
        document.getElementById('addAnimeBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal de anime
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Formulário de anime
        document.getElementById('animeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAnime();
        });

        // Modal de confirmação
        document.getElementById('closeConfirmModal').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.deleteAnime();
        });

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Pesquisa
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderAnimes();
        });

        // Filtro de gênero
        document.getElementById('genreFilter').addEventListener('change', (e) => {
            this.currentGenre = e.target.value;
            this.renderAnimes();
        });

        // Ordenação
        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderAnimes();
        });

        // Fechar modais com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeConfirmModal();
            }
        });

        // Fechar modais clicando fora
        document.getElementById('animeModal').addEventListener('click', (e) => {
            if (e.target.id === 'animeModal') {
                this.closeModal();
            }
        });

        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                this.closeConfirmModal();
            }
        });
    }

    // Abrir modal para adicionar/editar anime
    openModal(animeId = null) {
        const modal = document.getElementById('animeModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('animeForm');

        if (animeId) {
            // Modo edição
            this.editingAnimeId = animeId;
            const anime = this.animes.find(a => a.id === animeId);
            if (anime) {
                modalTitle.textContent = 'Editar Anime';
                this.fillForm(anime);
            }
        } else {
            // Modo adição
            this.editingAnimeId = null;
            modalTitle.textContent = 'Adicionar Novo Anime';
            form.reset();
        }

        modal.classList.add('active');
        document.getElementById('animeName').focus();
    }

    // Preencher formulário com dados do anime
    fillForm(anime) {
        document.getElementById('animeName').value = anime.name;
        document.getElementById('animeImage').value = anime.image || '';
        document.getElementById('imageUpload').value = '';
        document.getElementById('animeGenres').value = anime.genres || '';
        document.getElementById('animeStatus').value = anime.status;
        document.getElementById('totalSeasons').value = anime.totalSeasons || 1;
        document.getElementById('totalEpisodes').value = anime.totalEpisodes;
        document.getElementById('watchedEpisodes').value = anime.watchedEpisodes || 0;
        document.getElementById('startDate').value = anime.startDate || '';
        document.getElementById('endDate').value = anime.endDate || '';
        // Compatibilidade com animes antigos que podem ter externalLink em vez de externalLinks
        const externalLinks = anime.externalLinks || (anime.externalLink ? [anime.externalLink] : []);
        document.getElementById('externalLink1').value = externalLinks[0] || '';
        document.getElementById('externalLink2').value = externalLinks[1] || '';
        document.getElementById('externalLink3').value = externalLinks[2] || '';
        document.getElementById('isFavorite').checked = anime.isFavorite || false;
        document.getElementById('isHidden').checked = anime.isHidden || false;
    }

    // Fechar modal
    closeModal() {
        document.getElementById('animeModal').classList.remove('active');
        this.editingAnimeId = null;
    }

    // Salvar anime
    saveAnime() {
        console.log('Salvando anime...');
        
        // Processar upload de imagem
        const imageUpload = document.getElementById('imageUpload');
        let imageData = document.getElementById('animeImage').value.trim();
        
        if (imageUpload.files.length > 0) {
            const file = imageUpload.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                imageData = e.target.result;
                this.saveAnimeData(imageData);
            };
            reader.readAsDataURL(file);
            return;
        }
        
        this.saveAnimeData(imageData);
    }

    // Salvar dados do anime
    saveAnimeData(imageData) {
        console.log('Salvando dados do anime...');
        
        const formData = {
            name: document.getElementById('animeName').value.trim(),
            image: imageData,
            genres: document.getElementById('animeGenres').value.trim(),
            status: document.getElementById('animeStatus').value,
            totalSeasons: parseInt(document.getElementById('totalSeasons').value) || 1,
            totalEpisodes: parseInt(document.getElementById('totalEpisodes').value),
            watchedEpisodes: parseInt(document.getElementById('watchedEpisodes').value) || 0,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            externalLinks: [
                document.getElementById('externalLink1').value.trim(),
                document.getElementById('externalLink2').value.trim(),
                document.getElementById('externalLink3').value.trim()
            ].filter(link => link), // Remove links vazios
            isFavorite: document.getElementById('isFavorite').checked,
            isHidden: document.getElementById('isHidden').checked,
            dateAdded: new Date().toISOString()
        };

        console.log('Dados do formulário:', formData);

        if (!formData.name || !formData.totalEpisodes) {
            alert('Por favor, preencha os campos obrigatórios.');
            return;
        }

        if (this.editingAnimeId) {
            // Editar anime existente
            const index = this.animes.findIndex(a => a.id === this.editingAnimeId);
            if (index !== -1) {
                this.animes[index] = { ...this.animes[index], ...formData };
            }
        } else {
            // Adicionar novo anime
            const newAnime = {
                id: Date.now().toString(),
                ...formData
            };
            this.animes.push(newAnime);
        }

        this.saveAnimes();
        this.renderAnimes();
        this.updateStats();
        this.updateGenreFilter();
        this.closeModal();
    }

    // Abrir modal de confirmação para exclusão
    openConfirmModal(animeId) {
        const anime = this.animes.find(a => a.id === animeId);
        if (anime) {
            document.getElementById('confirmAnimeName').textContent = anime.name;
            document.getElementById('confirmModal').classList.add('active');
            this.animeToDelete = animeId;
        }
    }

    // Fechar modal de confirmação
    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('active');
        this.animeToDelete = null;
    }

    // Excluir anime
    deleteAnime() {
        if (this.animeToDelete) {
            this.animes = this.animes.filter(a => a.id !== this.animeToDelete);
            this.saveAnimes();
            this.renderAnimes();
            this.updateStats();
            this.updateGenreFilter();
            this.closeConfirmModal();
        }
    }

    // Definir filtro
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderAnimes();
    }

    // Filtrar e ordenar animes
    getFilteredAnimes() {
        let filtered = [...this.animes];

        // Aplicar filtro de status
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'favorites') {
                filtered = filtered.filter(anime => anime.isFavorite);
            } else if (this.currentFilter === 'hidden') {
                filtered = filtered.filter(anime => anime.isHidden);
            } else {
                filtered = filtered.filter(anime => anime.status === this.currentFilter);
            }
        } else {
            // No filtro "Todos", ocultar animes marcados como ocultos
            filtered = filtered.filter(anime => !anime.isHidden);
        }

        // Aplicar filtro de gênero
        if (this.currentGenre) {
            filtered = filtered.filter(anime => 
                anime.genres && anime.genres.toLowerCase().includes(this.currentGenre.toLowerCase())
            );
        }

        // Aplicar pesquisa
        if (this.searchTerm) {
            filtered = filtered.filter(anime => 
                anime.name.toLowerCase().includes(this.searchTerm) ||
                (anime.genres && anime.genres.toLowerCase().includes(this.searchTerm))
            );
        }

        // Aplicar ordenação
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'episodes':
                    return (b.totalEpisodes - b.watchedEpisodes) - (a.totalEpisodes - a.watchedEpisodes);
                case 'date':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                default:
                    return 0;
            }
        });

        return filtered;
    }

    // Renderizar lista de animes
    renderAnimes() {
        const animeList = document.getElementById('animeList');
        const filteredAnimes = this.getFilteredAnimes();

        if (filteredAnimes.length === 0) {
            animeList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tv"></i>
                    <h3>Nenhum anime encontrado</h3>
                    <p>${this.animes.length === 0 ? 'Adicione seu primeiro anime!' : 'Tente ajustar os filtros ou a pesquisa.'}</p>
                </div>
            `;
            return;
        }

        animeList.innerHTML = filteredAnimes.map(anime => this.createAnimeCard(anime)).join('');
    }

    // Criar card de anime
    createAnimeCard(anime) {
        const progress = anime.totalEpisodes > 0 ? (anime.watchedEpisodes / anime.totalEpisodes) * 100 : 0;
        const remainingEpisodes = anime.totalEpisodes - anime.watchedEpisodes;

        return `
            <div class="anime-card" data-id="${anime.id}">
                <div class="anime-image">
                    ${anime.image ? 
                        `<img src="${anime.image}" alt="${anime.name}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'><i class=\\'fas fa-image\\'></i></div>'">` :
                        `<div class="placeholder"><i class="fas fa-image"></i></div>`
                    }
                    <button class="favorite-btn ${anime.isFavorite ? 'active' : ''}" 
                            onclick="animeCatalog.toggleFavorite('${anime.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="anime-content">
                    <div class="anime-header">
                        <div>
                            <h3 class="anime-title">${anime.name}</h3>
                            <span class="anime-status status-${anime.status}">
                                ${this.getStatusText(anime.status)}
                            </span>
                        </div>
                    </div>
                    ${anime.genres ? `<p class="anime-genres">${anime.genres}</p>` : ''}
                    ${anime.totalSeasons && anime.totalSeasons > 1 ? `<p class="anime-seasons">${anime.totalSeasons} temporada${anime.totalSeasons > 1 ? 's' : ''}</p>` : ''}
                    <div class="anime-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${anime.watchedEpisodes} / ${anime.totalEpisodes} episódios</span>
                            <span>${remainingEpisodes > 0 ? remainingEpisodes + ' restantes' : 'Concluído!'}</span>
                        </div>
                    </div>
                    <div class="anime-actions">
                        <button class="action-btn" onclick="animeCatalog.incrementEpisode('${anime.id}')" title="+1 Episódio">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="action-btn" onclick="animeCatalog.openModal('${anime.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                         ${(() => {
                             const links = anime.externalLinks || (anime.externalLink ? [anime.externalLink] : []);
                             return links.length > 0 ? 
                                 links.map((link, index) => 
                                     `<a href="${link}" target="_blank" class="action-btn" title="Link ${index + 1}">
                                         <i class="fas fa-external-link-alt"></i>
                                     </a>`
                                 ).join('') : '';
                         })()}
                        <button class="action-btn ${anime.isHidden ? 'active' : ''}" onclick="animeCatalog.toggleHidden('${anime.id}')" title="${anime.isHidden ? 'Mostrar' : 'Ocultar'}">
                            <i class="fas fa-eye${anime.isHidden ? '-slash' : ''}"></i>
                        </button>
                        <button class="action-btn" onclick="animeCatalog.openConfirmModal('${anime.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Obter texto do status
    getStatusText(status) {
        const statusMap = {
            'watching': 'Assistindo',
            'completed': 'Terminado',
            'plan': 'Quero Assistir'
        };
        return statusMap[status] || status;
    }

    // Incrementar episódio
    incrementEpisode(animeId) {
        const anime = this.animes.find(a => a.id === animeId);
        if (anime && anime.watchedEpisodes < anime.totalEpisodes) {
            anime.watchedEpisodes++;
            if (anime.watchedEpisodes >= anime.totalEpisodes) {
                anime.status = 'completed';
                anime.endDate = new Date().toISOString().split('T')[0];
            }
            this.saveAnimes();
            this.renderAnimes();
            this.updateStats();
        }
    }

    // Alternar favorito
    toggleFavorite(animeId) {
        const anime = this.animes.find(a => a.id === animeId);
        if (anime) {
            anime.isFavorite = !anime.isFavorite;
            this.saveAnimes();
            this.renderAnimes();
            this.updateStats();
        }
    }

    // Alternar oculto
    toggleHidden(animeId) {
        const anime = this.animes.find(a => a.id === animeId);
        if (anime) {
            anime.isHidden = !anime.isHidden;
            this.saveAnimes();
            this.renderAnimes();
            this.updateStats();
        }
    }

    // Atualizar estatísticas
    updateStats() {
        // Filtrar apenas animes visíveis (não ocultos) para estatísticas gerais
        const visibleAnimes = this.animes.filter(anime => !anime.isHidden);
        
        const totalAnimes = visibleAnimes.length;
        const totalEpisodios = visibleAnimes.reduce((sum, anime) => sum + (anime.watchedEpisodes || 0), 0);
        const tempoTotal = Math.round(totalEpisodios * 24 / 60); // 24 minutos por episódio
        const totalFavoritos = visibleAnimes.filter(anime => anime.isFavorite).length;

        // Contadores por status (apenas animes visíveis)
        const watchingCount = visibleAnimes.filter(anime => anime.status === 'watching').length;
        const completedCount = visibleAnimes.filter(anime => anime.status === 'completed').length;
        const planCount = visibleAnimes.filter(anime => anime.status === 'plan').length;
        const hiddenCount = this.animes.filter(anime => anime.isHidden).length;

        // Atualizar estatísticas principais
        document.getElementById('totalAnimes').textContent = totalAnimes;
        document.getElementById('totalEpisodios').textContent = totalEpisodios;
        document.getElementById('tempoTotal').textContent = `${tempoTotal}h`;
        document.getElementById('totalFavoritos').textContent = totalFavoritos;

        // Atualizar contadores dos filtros
        document.getElementById('watchingCount').textContent = watchingCount;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('planCount').textContent = planCount;
        document.getElementById('hiddenCount').textContent = hiddenCount;
    }

    // Atualizar filtro de gêneros
    updateGenreFilter() {
        const genreSelect = document.getElementById('genreFilter');
        const currentValue = genreSelect.value;
        
        // Coletar todos os gêneros únicos
        const allGenres = new Set();
        this.animes.forEach(anime => {
            if (anime.genres) {
                anime.genres.split(',').forEach(genre => {
                    allGenres.add(genre.trim());
                });
            }
        });

        // Manter a opção "Todos os gêneros"
        genreSelect.innerHTML = '<option value="">Todos os gêneros</option>';
        
        // Adicionar opções de gêneros
        Array.from(allGenres).sort().forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });

        // Restaurar valor selecionado se ainda existir
        if (currentValue && Array.from(allGenres).includes(currentValue)) {
            genreSelect.value = currentValue;
        }
    }
}

// Inicializar o catálogo quando a página carregar
let animeCatalog;
document.addEventListener('DOMContentLoaded', () => {
    animeCatalog = new AnimeCatalog();
});

// Funções globais para uso nos event handlers
window.animeCatalog = null;

// Aguardar o carregamento completo da página
window.addEventListener('load', () => {
    window.animeCatalog = animeCatalog;
});
