/**
 * History Management System - Tracks all game events with undo/redo capability
 */

export const historyUtils = {
  /**
   * Create an event object with details of what changed
   */
  createEvent(type, actionName, beforeState, afterState, playerChanges, actionKey = null) {
    return {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type: type, // 'score_update', 'add_player', 'remove_player', 'new_game'
      actionName: actionName, // Display name for the event,
      actionKey: actionKey, // i18n key for the action
      beforeState: JSON.parse(JSON.stringify(beforeState)), // Deep clone
      afterState: JSON.parse(JSON.stringify(afterState)), // Deep clone
      playerChanges: playerChanges // Array of player changes
    };
  },

  /**
   * Initialize history from localStorage
   */
  loadHistory(gameId) {
    const historyKey = `gameHistory_${gameId}`;
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [];
  },

  /**
   * Save history to localStorage
   */
  saveHistory(gameId, history) {
    const historyKey = `gameHistory_${gameId}`;
    localStorage.setItem(historyKey, JSON.stringify(history));
  },

  /**
   * Add event to history
   */
  addEvent(history, event) {
    // Clear any redo history when a new action is taken
    history = history.slice(0);
    history.push(event);
    return history;
  },

  /**
   * Get undo history (all events)
   */
  getUndoHistory(history, currentPosition) {
    return history.slice(0, currentPosition);
  },

  /**
   * Get redo history (future events)
   */
  getRedoHistory(history, currentPosition) {
    return history.slice(currentPosition);
  },

  /**
   * Calculate player changes between two game states
   */
  calculatePlayerChanges(beforePlayers, afterPlayers) {
    const changes = [];

    // Find players with score changes
    beforePlayers.forEach((beforePlayer) => {
      const afterPlayer = afterPlayers.find((p) => p.ID === beforePlayer.ID);
      if (afterPlayer && beforePlayer.Score !== afterPlayer.Score) {
        changes.push({
          playerId: beforePlayer.ID,
          playerName: beforePlayer.Name,
          scoreBefore: beforePlayer.Score,
          scoreAfter: afterPlayer.Score,
          scoreChange: afterPlayer.Score - beforePlayer.Score
        });
      }
    });

    // Find added players
    beforePlayers.forEach((player) => {
      if (!beforePlayers.find((p) => p.ID === player.ID)) {
        changes.push({
          playerId: player.ID,
          playerName: player.Name,
          type: 'added',
          scoreBefore: 0,
          scoreAfter: player.Score,
          scoreChange: player.Score
        });
      }
    });

    // Find removed players
    afterPlayers.forEach((player) => {
      if (!afterPlayers.find((p) => p.ID === player.ID)) {
        changes.push({
          playerId: player.ID,
          playerName: player.Name,
          type: 'removed',
          scoreBefore: player.Score,
          scoreAfter: 0,
          scoreChange: -player.Score
        });
      }
    });

    return changes;
  },

  /**
   * Format event for display
   */
  formatEvent(event) {
    const date = new Date(event.timestamp);
    const time = date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return {
      ...event,
      displayTime: time,
      playerChangesSummary:
        event.playerChanges && event.playerChanges.length > 0
          ? event.playerChanges
              .map((change) => {
                if (change.type === 'added') {
                  return `${change.playerName} ${change.type}`;
                } else if (change.type === 'removed') {
                  return `${change.playerName} ${change.type}`;
                } else {
                  const sign = change.scoreChange >= 0 ? '+' : '';
                  return `${change.playerName}: ${sign}${change.scoreChange}`;
                }
              })
              .join(' | ')
          : 'noChanges'
    };
  }
};
