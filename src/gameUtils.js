/**
 * Game Logic Utilities - Contains all business logic independent of UI framework
 */

export const gameUtils = {
  /**
   * Initialize game info from localStorage or return null
   */
  loadGameInfo() {
    const gameInfo = localStorage.getItem('gameInfo');
    return gameInfo ? JSON.parse(gameInfo) : null;
  },

  /**
   * Save game info to localStorage
   */
  saveGameInfo(gameInfo) {
    localStorage.setItem('gameInfo', JSON.stringify(gameInfo));
  },

  /**
   * Save backup of game info
   */
  backupGameInfo(gameInfo) {
    localStorage.setItem('gameInfoBackup', JSON.stringify(gameInfo));
  },

  /**
   * Load backup game info from localStorage
   */
  loadGameBackup() {
    const backup = localStorage.getItem('gameInfoBackup');
    return backup ? JSON.parse(backup) : null;
  },

  /**
   * Create a new game
   */
  createNewGame(maxScore, existingPlayers = []) {
    const players = existingPlayers.map(player => ({
      ...player,
      Score: 0
    }));

    const currentDate = new Date();
    const gameInfo = {
      gameId: Date.now(),
      gameDate: currentDate.toISOString().split('T')[0],
      maxScore: parseInt(maxScore),
      players: players
    };

    this.saveGameInfo(gameInfo);
    return gameInfo;
  },

  /**
   * Add a new player to the game
   */
  addPlayer(gameInfo, playerName) {
    if (!playerName || playerName.trim() === '') {
      return null;
    }

    const newPlayer = {
      ID: Date.now(),
      Name: playerName,
      Score: 0
    };

    gameInfo.players.push(newPlayer);
    this.saveGameInfo(gameInfo);
    return newPlayer;
  },

  /**
   * Remove a player from the game
   */
  removePlayer(gameInfo, playerId) {
    gameInfo.players = gameInfo.players.filter(player => player.ID !== playerId);
    this.saveGameInfo(gameInfo);
  },

  /**
   * Update player score
   */
  updatePlayerScore(gameInfo, playerId, scoreChange) {
    const playerIdx = gameInfo.players.findIndex(p => p.ID === playerId);
    if (playerIdx !== -1) {
      gameInfo.players[playerIdx].Score += scoreChange;
      this.saveGameInfo(gameInfo);
    }
  },

  /**
   * Get action score details based on action type
   */
  getActionDetails(actionType) {
    const details = {
      Hand: {
        multipleBy: 1,
        isHandType: true,
        arActionName: 'هند',
        actionKey: 'hand',
        loserNum: 200,
        winnerNum: -60
      },
      SuperHand: {
        multipleBy: 2,
        isHandType: true,
        arActionName: 'سوبر',
        actionKey: 'superHand',
        loserNum: 200,
        winnerNum: -60
      },
      FullHand: {
        multipleBy: 3,
        isHandType: true,
        arActionName: 'فلل',
        actionKey: 'fullHand',
        loserNum: 200,
        winnerNum: -60
      },
      Finished: {
        multipleBy: 1,
        isHandType: false,
        arActionName: 'خالص',
        actionKey: 'finished',
        loserNum: 100,
        winnerNum: -30
      }
    };

    return details[actionType] || {};
  },

  /**
   * Calculate initial action score
   */
  calculateActionScore(actionType) {
    const details = this.getActionDetails(actionType);
    return details.loserNum * details.multipleBy;
  },

  /**
   * Get active players (those below max score)
   */
  getActivePlayers(gameInfo) {
    return gameInfo.players.filter(player => player.Score < gameInfo.maxScore);
  },

  /**
   * Get loser players (those at or above max score)
   */
  getLoserPlayers(gameInfo) {
    return gameInfo.players.filter(player => player.Score >= gameInfo.maxScore);
  },

  /**
   * Get sorted active players by score
   */
  getSortedActivePlayers(gameInfo) {
    const active = this.getActivePlayers(gameInfo);
    return active.sort((a, b) => Number(a.Score) - Number(b.Score));
  },

  /**
   * Get the player with lowest score among active players
   */
  getLowestScorePlayer(gameInfo) {
    const active = this.getActivePlayers(gameInfo);
    if (active.length === 0) return null;
    return active.sort((a, b) => a.Score - b.Score)[0];
  },

  /**
   * Check if it's not the first game (has players with non-zero scores)
   */
  isNotFirstGame(gameInfo) {
    const active = this.getActivePlayers(gameInfo);
    return active.filter(p => p.Score !== 0).length > 0;
  }
};
