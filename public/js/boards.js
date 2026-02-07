// Pouvoirs selon le nombre de joueurs (avec emojis)
// 5-6 joueurs : 1-2: Rien, 3: Peek (Inspection), 4-5: Exécution, 6: Victoire
// 7-8 joueurs : 1: Rien, 2: Enquête, 3: Succession, 4-5: Exécution, 6: Victoire
// 9-10 joueurs : 1-2: Enquête, 3: Succession, 4-5: Exécution, 6: Victoire

function updateBoardPowers(playerCount) {
    const markers = document.querySelectorAll('.conspirators-marker .power-label');

    // Définir les pouvoirs selon le nombre de joueurs (emojis)
    let powers = [];

    if (playerCount <= 6) {
        // 5-6 joueurs
        powers = ['', '', '👁️', '💀', '💀', '🏆'];
    } else if (playerCount <= 8) {
        // 7-8 joueurs
        powers = ['', '🔍', '👑', '💀', '💀', '🏆'];
    } else {
        // 9-10 joueurs
        powers = ['🔍', '🔍', '👑', '💀', '💀', '🏆'];
    }

    markers.forEach((marker, index) => {
        if (index < powers.length) {
            marker.textContent = powers[index];
        }
    });
}

// Fonction pour mettre à jour les plateaux de progression
function updateProgressionBoards(plotsCount, editsCount) {
    // Mettre à jour le plateau des Complots
    const plotMarkers = document.querySelectorAll('.conspirators-marker');
    plotMarkers.forEach((marker, index) => {
        if (index < plotsCount) {
            marker.classList.add('active');
            // Animation d'apparition
            setTimeout(() => {
                marker.style.animation = 'none';
                setTimeout(() => {
                    marker.style.animation = '';
                }, 10);
            }, index * 200);
        } else {
            marker.classList.remove('active');
        }
    });

    // Mettre à jour le plateau des Édits Royaux
    const editMarkers = document.querySelectorAll('.loyalists-marker');
    editMarkers.forEach((marker, index) => {
        if (index < editsCount) {
            marker.classList.add('active');
            // Animation d'apparition
            setTimeout(() => {
                marker.style.animation = 'none';
                setTimeout(() => {
                    marker.style.animation = '';
                }, 10);
            }, index * 200);
        } else {
            marker.classList.remove('active');
        }
    });
}

// Fonction pour mettre à jour l'ordre des joueurs
function updatePlayerOrder(players, currentKingId, currentChancellorId) {
    const container = document.getElementById('player-order-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    players.forEach(player => {
        const token = document.createElement('div');
        token.className = 'player-token';
        
        if (player.id === currentKingId) {
            token.classList.add('current-king');
        }
        if (player.id === currentChancellorId) {
            token.classList.add('current-chancellor');
        }
        if (!player.isAlive) {
            token.classList.add('eliminated');
        }
        
        token.textContent = player.name;
        container.appendChild(token);
    });
}

// Exposer les fonctions globalement
window.updateProgressionBoards = updateProgressionBoards;
window.updatePlayerOrder = updatePlayerOrder;
window.updateBoardPowers = updateBoardPowers;
