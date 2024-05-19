/**
 * Ouvre la boîte modale pour afficher les détails d'une entrée
 * @param {Object} entry - L'entrée à afficher dans la modale
 */
function openModal(entry) {
    const modal = document.getElementById('details-modal');
    const modalDetails = document.getElementById('modal-details');
    
    modalDetails.innerHTML = `
        <h2>${entry.name}</h2>
        <p><strong>Type:</strong> ${entry.type}</p>
        <p><strong>Statut:</strong> ${entry.status}</p>
        ${entry.type === 'serie' ? `<p><strong>Saison:</strong> ${entry.season}, <strong>Épisode:</strong> ${entry.episode}</p>` : ''}
        <p><strong>Commentaire:</strong> ${entry.comment}</p>
        <p><strong>Note:</strong> ${'★'.repeat(entry.rating)}</p>
        ${entry.imagePath ? `<img src="${entry.imagePath}" alt="${entry.name}" style="max-width: 100%;">` : ''}
    `;
    
    modal.style.display = 'block';
}

/**
 * Ferme la boîte modale
 */
function closeModal() {
    const modal = document.getElementById('details-modal');
    modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    loadEntries().then(entries => {
        applyFiltersAndSort(entries);
    });

    const filterRadios = document.querySelectorAll('input[name="status-filter"]');
    filterRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            loadEntries().then(entries => {
                applyFiltersAndSort(entries);
            });
        });
    });

    document.getElementById('sort-by').addEventListener('change', () => {
        loadEntries().then(entries => {
            applyFiltersAndSort(entries);
        });
    });
});

document.getElementById('film-series-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitEntry();
    resetForm();
    loadEntries().then(entries => {
        applyFiltersAndSort(entries);
    });
});

/**
 * Réinitialise le formulaire d'entrée
 */
function resetForm() {
    document.getElementById('film-series-form').reset();
    document.getElementById('entry-id').value = '';
    toggleEpisodeSeasonFields(); // Assurez-vous que les champs saison et épisode sont correctement réinitialisés
}

/**
 * Affiche une notification à l'utilisateur
 * @param {string} message - Le message de la notification
 * @param {boolean} [isError=false] - Indique si la notification est une erreur
 */
function showNotification(message, isError = false) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.classList.add(isError ? 'error' : 'success');
    notification.innerText = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Soumet une nouvelle entrée ou une modification d'entrée
 */
async function submitEntry() {
    const formData = new FormData(document.getElementById('film-series-form'));
    formData.append('action', 'submit');
    const entryId = document.getElementById('entry-id').value;
    if (!entryId) {
        formData.delete('id');
    } else {
        formData.append('id', entryId);
    }

    const response = await fetch('api.php', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        showNotification('Erreur lors de l\'envoi du formulaire', true);
        return;
    }
    
    try {
        const responseText = await response.text();
        const result = JSON.parse(responseText);
        if (result.error) {
            showNotification(result.message, true);
        } else {
            showNotification('Entrée enregistrée avec succès');
        }
    } catch (error) {
        console.error('Erreur lors de la réponse JSON:', error);
        console.error('Réponse texte:', responseText);
        showNotification('Erreur lors de la réponse JSON', true);
    }
}

/**
 * Charge toutes les entrées depuis la base de données
 * @returns {Promise<Array>} - Un tableau d'entrées
 */
async function loadEntries() {
    try {
        const response = await fetch('api.php?action=fetchAll');
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des entrées:', error);
    }
}

/**
 * Applique les filtres et le tri sur les entrées
 * @param {Array} entries - Les entrées à filtrer et trier
 */
function applyFiltersAndSort(entries) {
    const statusFilter = document.querySelector('input[name="status-filter"]:checked').value;
    const sortBy = document.getElementById('sort-by').value;

    let filteredEntries = entries;

    if (statusFilter !== 'tous') {
        filteredEntries = entries.filter(entry => entry.status === statusFilter);
    }

    filteredEntries.sort((a, b) => {
        // Prioritize favorites
        if (a.favori !== b.favori) {
            return b.favori - a.favori; // Descending order of favorites
        }
        // Sort by the selected criterion
        if (sortBy === 'rating') {
            return b[sortBy] - a[sortBy]; // Descending order for rating
        }
        return a[sortBy].localeCompare(b[sortBy]); // Ascending order for other criteria
    });

    displayEntries(filteredEntries);
}

/**
 * Affiche les entrées dans le conteneur prévu
 * @param {Array} entries - Les entrées à afficher
 */
function displayEntries(entries) {
    const entriesContainer = document.getElementById('entries-container');
    entriesContainer.innerHTML = '';

    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('entry');
        entryDiv.innerHTML = `
            <div class="entry-image">
                <img src="${entry.imagePath}" alt="${entry.name}">
            </div>
            <div class="entry-info">
                <h3>${truncateText(entry.name, 30)}</h3>
                <p>Type: ${entry.type}</p>
                <p>Statut: ${entry.status}</p>
                ${entry.type === 'serie' ? `<p>Saison: ${entry.season}, Épisode: ${entry.episode}</p>` : ''}
                <p>Commentaire: ${truncateText(entry.comment, 50)}</p>
                <p>Note: ${'★'.repeat(entry.rating)}</p>
                <button onclick="editEntry('${entry.id}')">Modifier</button>
                <button onclick="deleteEntry('${entry.id}')">Supprimer</button>
                <button onclick="toggleFavorite('${entry.id}')">${entry.favori ? '★' : '☆'}</button>
                <button class="details-button" data-entry='${JSON.stringify(entry).replace(/'/g, "&apos;")}'>Détails</button>
            </div>
        `;
        entriesContainer.appendChild(entryDiv);
    });

    // Ajouter des écouteurs d'événements pour les boutons "Détails"
    const detailsButtons = document.querySelectorAll('.details-button');
    detailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const entry = JSON.parse(this.getAttribute('data-entry').replace(/&apos;/g, "'"));
            openModal(entry);
        });
    });
}

/**
 * Fait défiler la page jusqu'au formulaire
 */
function scrollToForm() {
    const formSection = document.getElementById('form-section');
    formSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Charge les détails d'une entrée pour modification
 * @param {number} id - L'identifiant de l'entrée à modifier
 */
async function editEntry(id) {
    const response = await fetch(`api.php?action=getEntry&id=${id}`);
    if (!response.ok) throw new Error('Erreur réseau lors de la récupération de l\'entrée');
    const entry = await response.json();

    if (entry) {
        document.getElementById('entry-id').value = entry.id;
        document.getElementById('name').value = entry.name;
        document.getElementById('type').value = entry.type;
        document.getElementById('status').value = entry.status;
        document.getElementById('favori').checked = entry.favori === 1;
        if (entry.type === 'serie') {
            document.getElementById('season').value = entry.season || '';
            document.getElementById('episode').value = entry.episode || '';
        }
        document.getElementById('comment').value = entry.comment;
        document.getElementById('rating').value = entry.rating;
        
        const imagePreview = document.getElementById('image-preview');
        if (entry.imagePath) {
            imagePreview.innerHTML = `<img src="${entry.imagePath}" alt="Image Preview" style="max-width: 200px;"/>`;
        } else {
            imagePreview.innerHTML = 'Aucune image';
        }

        toggleEpisodeSeasonFields();
        scrollToForm(); // Scroll to the form section after filling it
    }
}

/**
 * Supprime une entrée
 * @param {number} id - L'identifiant de l'entrée à supprimer
 */
async function deleteEntry(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) return;

    try {
        const response = await fetch(`api.php?action=delete&id=${id}`, { method: 'POST' });
        if (!response.ok) throw new Error('Erreur réseau');
        
        const result = await response.json();
        if (result.success) {
            loadEntries().then(entries => {
                applyFiltersAndSort(entries);
            }); // Recharge la liste après suppression
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

/**
 * Prévisualise l'image uploadée
 * @param {Event} event - L'événement de changement de fichier
 */
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('image-preview');
        output.innerHTML = `<img src="${reader.result}" alt="Image preview" style="max-width: 200px;"/>`;
    };
    reader.readAsDataURL(event.target.files[0]);
}

/**
 * Bascule l'état favori d'une entrée
 * @param {number} id - L'identifiant de l'entrée à mettre à jour
 */
async function toggleFavorite(id) {
    const response = await fetch(`api.php?action=toggleFavorite&id=${id}`, { method: 'POST' });
    if (!response.ok) throw new Error('Erreur réseau');
    loadEntries().then(entries => {
        applyFiltersAndSort(entries);
    });
}

/**
 * Tronque le texte à une longueur maximale et ajoute "..." si nécessaire
 * @param {string} text - Le texte à tronquer
 * @param {number} maxLength - La longueur maximale du texte
 * @returns {string} - Le texte tronqué
 */
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}
