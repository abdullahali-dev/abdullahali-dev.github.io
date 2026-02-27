<template>
  <div id="app" class="my-container">
    <div class="content-wrap">
      <div class="card bg-dark text-white border-white">
        <div class="card-header border-white">
          <div class="card-title d-flex justify-content-between align-items-center">
              <button
              id="NewGameBtn"
              class="btn btn-info btn-new-game float-left d-inline"
              @click="openNewGameDialog"
              >
              {{ t('app.newGame') }}
            </button>
            <h4 class="noselect m-0 p-0 mt-2" id="title" style="user-select: none">{{ t('app.title') }}</h4>
          </div>
        </div>
        <div class="card-body p-2" dir="rtl">
          <!-- Max Score Display -->
          <div v-if="gameInfo" class="text-center text-white-50" role="alert">
            <button
              @click="openEditMaxScoreDialog"
              class="btn btn-sm btn-outline-info"
              style="padding: 0.25rem 0.5rem; font-size: 0.9rem"
              :title="t('app.editMaxScore')"
            >
              <strong>{{ t('app.maxScore') }}: {{ gameInfo.maxScore }}</strong>
            </button>
          </div>

          <div class="m-2 justify-content-center">
            <div class="col-12 text-center">
              <button class="btn btn-success btn-action m-1" @click="initAction('Hand')">
                {{ t('actions.hand') }}
              </button>
              <button class="btn btn-warning btn-action m-1" @click="initAction('SuperHand')">
                {{ t('actions.superHand') }}
              </button>
              <button class="btn btn-danger btn-action m-1" @click="initAction('FullHand')">
                {{ t('actions.fullHand') }}
              </button>
              <button class="btn btn-primary btn-action m-1" @click="initAction('Finished')">
                {{ t('actions.finished') }}
              </button>
            </div>
            <div class="col-12 text-center">
              <button
                id="BtnUndo"
                class="btn btn-outline-success"
                style="width: 110px; margin: 4px"
                @click="undo"
                :disabled="!canUndo"
                type="button"
              >
                {{ t('app.undo') }}
              </button>
              <button
                id="BtnRedo"
                class="btn btn-outline-success"
                style="width: 110px; margin: 4px"
                @click="redo"
                :disabled="!canRedo"
                type="button"
              >
                {{ t('app.redo') }}
              </button>
              <button
                id="BtnHistory"
                class="btn btn-outline-info"
                style="width: 110px; margin: 4px"
                @click="openHistory"
                type="button"
              >
                {{ t('app.history') }}
              </button>
            </div>
          </div>

          <!-- Players Table -->
          <PlayersTable
            v-if="gameInfo"
            :gameInfo="gameInfo"
            @add-player="handleAddPlayerEvent"
            @remove-player="removePlayer"
          />

          <hr />

          <!-- Losers Table -->
          <LosersTable v-if="gameInfo && loserPlayers.length > 0" :loserPlayers="loserPlayers" />
        </div>
      </div>
      <div class="my-footer">
        Create by <a href="mailto:abdullah.dev3@gmail.com.com">Abdullah Ali</a> © 2022
      </div>
    </div>

    <!-- Score Input Modal -->
    <ScoreInputModal
      v-if="showScoreModal"
      :activePlayers="activePlayers"
      :actionType="currentActionType"
      :gameInfo="gameInfo"
      @update:scores="updateScores"
      @close="closeScoreModal"
    />

    <!-- History Modal -->
    <HistoryModal
      v-if="showHistoryModal"
      :events="events"
      @close="closeHistoryModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import PlayersTable from './components/PlayersTable.vue';
import LosersTable from './components/LosersTable.vue';
import ScoreInputModal from './components/ScoreInputModal.vue';
import HistoryModal from './components/HistoryModal.vue';
import { gameUtils } from './gameUtils';
import { historyUtils } from './historyUtils';

export default {
  components: {
    PlayersTable,
    LosersTable,
    ScoreInputModal,
    HistoryModal
  },
  setup() {
    const { t } = useI18n();
    const gameInfo = ref(null);
    const playerNameInput = ref('');
    const showScoreModal = ref(false);
    const currentActionType = ref('');
    const showHistoryModal = ref(false);
    const events = ref([]);
    const removedEvents = ref([]); // Stack of removed events for redo

    const activePlayers = computed(() => {
      return gameInfo.value ? gameUtils.getSortedActivePlayers(gameInfo.value) : [];
    });

    const loserPlayers = computed(() => {
      return gameInfo.value ? gameUtils.getLoserPlayers(gameInfo.value) : [];
    });

    const canUndo = computed(() => events.value.length > 0);

    const canRedo = computed(() => removedEvents.value.length > 0);

    onMounted(() => {
      registerServiceWorker();
      loadGameInfo();
      setupGestureHandlers();
    });

    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
      }
    };

    const setupGestureHandlers = () => {
      document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
        document.body.style.zoom = 0.99;
      });

      document.addEventListener('gesturechange', (e) => {
        e.preventDefault();
        document.body.style.zoom = 0.99;
      });

      document.addEventListener('gestureend', (e) => {
        e.preventDefault();
        document.body.style.zoom = 0.99;
      });
    };

    const loadGameInfo = () => {
      const saved = gameUtils.loadGameInfo();
      if (saved) {
        gameInfo.value = saved;
        // Load history for this game
        events.value = historyUtils.loadHistory(saved.gameId);
        removedEvents.value = [];
      }
    };

    const openNewGameDialog = () => {
      const maxScore = window.prompt(t('prompts.maxScore'));
      if (maxScore === null) return;

      if (!maxScore.match('^[0-9]+$')) {
        alert(t('prompts.invalidNumber'));
        return;
      }

      const existingPlayers = gameInfo.value ? gameInfo.value.players : [];
      const newGameInfo = gameUtils.createNewGame(maxScore, existingPlayers);
      gameInfo.value = newGameInfo;
      
      // Reset history for new game
      events.value = [];
      removedEvents.value = [];
      historyUtils.saveHistory(newGameInfo.gameId, []);
    };

    const openEditMaxScoreDialog = () => {
      if (!gameInfo.value) return;

      const currentMaxScore = gameInfo.value.maxScore;
      const newMaxScore = window.prompt(
        `${t('prompts.currentMaxScore')}: ${currentMaxScore}\n${t('prompts.maxScore')}`,
        currentMaxScore.toString()
      );

      if (newMaxScore === null) return;

      // Trim and validate
      const trimmedScore = newMaxScore.trim();

      // Check if it's a valid number
      if (!trimmedScore.match('^[0-9]+$')) {
        alert(t('prompts.invalidMaxScore'));
        return;
      }

      const parsedScore = parseInt(trimmedScore, 10);

      // Validate that new score is positive
      if (parsedScore <= 0) {
        alert(t('prompts.invalidMaxScore'));
        return;
      }

      // Check if new max score is less than current highest player score
      const highestPlayerScore = Math.max(
        ...gameInfo.value.players.map((p) => p.Score),
        0
      );

      if (parsedScore < highestPlayerScore) {
        alert(
          `${t('prompts.maxScoreLessThanCurrent')}: ${highestPlayerScore}`
        );
        return;
      }

      // Update max score
      const beforeState = JSON.parse(JSON.stringify(gameInfo.value));
      gameInfo.value.maxScore = parsedScore;

      // Save to localStorage
      gameUtils.saveGameInfo(gameInfo.value);

      // Add to history
      const playerChanges = [
        {
          playerId: 'maxScore',
          playerName: `${t('app.maxScore')}`,
          type: 'maxScoreChange',
          scoreBefore: currentMaxScore,
          scoreAfter: parsedScore,
          scoreChange: parsedScore - currentMaxScore
        }
      ];

      addEvent('max_score_update', t('app.editMaxScore'), beforeState, playerChanges);
    };

    const addEvent = (type, actionName, beforeState, playerChanges, actionKey = null) => {
      // Clear redo stack when a new action is taken
      removedEvents.value = [];
      
      const event = historyUtils.createEvent(
        type,
        actionName,
        beforeState,
        gameInfo.value,
        playerChanges,
        actionKey
      );
      
      events.value.push(event);
      
      // Save to localStorage
      if (gameInfo.value) {
        historyUtils.saveHistory(gameInfo.value.gameId, events.value);
      }
    };

    const addPlayer = () => {
      if (!gameInfo.value) {
        alert('قم بإنشاء لعبة جديدة أولاً');
        return;
      }

      if (!playerNameInput.value.trim()) {
        return;
      }

      handleAddPlayerEvent(playerNameInput.value);
      playerNameInput.value = '';
    };

    const handleAddPlayerEvent = (playerName) => {
      if (!gameInfo.value) {
        alert(t('prompts.createGameFirst'));
        return;
      }

      const beforeState = JSON.parse(JSON.stringify(gameInfo.value));
      
      // Calculate top player score + 25
      const topPlayerScore = Math.max(...gameInfo.value.players.map((p) => p.Score), 0);
      const startingScore = topPlayerScore + 25;
      
      // Add player with calculated starting score
      const newPlayer = gameUtils.addPlayer(gameInfo.value, playerName, startingScore);
      gameInfo.value = { ...gameInfo.value };
      
      // Record event for adding player
      if (newPlayer) {
        const playerChanges = [{
          playerId: newPlayer.ID,
          playerName: newPlayer.Name,
          type: 'added',
          scoreBefore: 0,
          scoreAfter: startingScore,
          scoreChange: startingScore
        }];
        
        addEvent('add_player', `${t('deletePlayer.message').replace('حذف', 'إضافة')}: ${newPlayer.Name}`, beforeState, playerChanges);
      }
    };

    const removePlayer = (playerId) => {
      if (!confirm(t('players.confirmDelete'))) return;

      const beforeState = JSON.parse(JSON.stringify(gameInfo.value));
      const removedPlayer = gameInfo.value.players.find((p) => p.ID === playerId);
      
      gameUtils.removePlayer(gameInfo.value, playerId);
      gameInfo.value = { ...gameInfo.value };
      
      const playerChanges = [{
        playerId: playerId,
        playerName: removedPlayer.Name,
        type: 'removed',
        scoreBefore: removedPlayer.Score,
        scoreAfter: 0,
        scoreChange: -removedPlayer.Score
      }];
      
      addEvent('remove_player', `${t('deletePlayer.message')}: ${removedPlayer.Name}`, beforeState, playerChanges);
    };

    const initAction = (actionType) => {
      if (!gameInfo.value) {
        alert(t('prompts.createGameFirst'));
        return;
      }

      currentActionType.value = actionType;
      showScoreModal.value = true;
    };

    const updateScores = (scores) => {
      const beforeState = JSON.parse(JSON.stringify(gameInfo.value));
      const beforePlayers = JSON.parse(JSON.stringify(gameInfo.value.players));

      Object.entries(scores).forEach(([playerId, score]) => {
        if (Number.isInteger(score)) {
          gameUtils.updatePlayerScore(gameInfo.value, parseInt(playerId), score);
        }
      });

      const playerChanges = historyUtils.calculatePlayerChanges(beforePlayers, gameInfo.value.players);
      const actionDetails = gameUtils.getActionDetails(currentActionType.value);
      addEvent('score_update', currentActionType.value, beforeState, playerChanges, actionDetails.actionKey);

      gameInfo.value = { ...gameInfo.value };
      showScoreModal.value = false;
    };

    const closeScoreModal = () => {
      showScoreModal.value = false;
    };

    const undo = () => {
      if (!canUndo.value) return;
      
      // Remove the last event from history
      const removedEvent = events.value.pop();
      
      // Push to removed events stack for redo
      removedEvents.value.push(removedEvent);
      
      // Restore game state to before this event
      if (events.value.length > 0) {
        // Restore to the state at the end of the previous event
        gameInfo.value = JSON.parse(JSON.stringify(events.value[events.value.length - 1].afterState));
      } else {
        // No events left, restore to the initial state (beforeState of the removed event)
        gameInfo.value = JSON.parse(JSON.stringify(removedEvent.beforeState));
      }
      
      // Save updated history to localStorage
      if (gameInfo.value) {
        historyUtils.saveHistory(gameInfo.value.gameId, events.value);
      }
    };

    const redo = () => {
      if (!canRedo.value) return;
      
      // Restore the last removed event
      const restoredEvent = removedEvents.value.pop();
      
      // Push back to events history
      events.value.push(restoredEvent);
      
      // Restore game state to after this event
      gameInfo.value = JSON.parse(JSON.stringify(restoredEvent.afterState));
      
      // Save updated history to localStorage
      if (gameInfo.value) {
        historyUtils.saveHistory(gameInfo.value.gameId, events.value);
      }
    };

    const openHistory = () => {
      showHistoryModal.value = true;
    };

    const closeHistoryModal = () => {
      showHistoryModal.value = false;
    };

    return {
      gameInfo,
      playerNameInput,
      showScoreModal,
      currentActionType,
      showHistoryModal,
      events,
      activePlayers,
      loserPlayers,
      canUndo,
      canRedo,
      t,
      openNewGameDialog,
      openEditMaxScoreDialog,
      addPlayer,
      handleAddPlayerEvent,
      removePlayer,
      initAction,
      updateScores,
      closeScoreModal,
      undo,
      redo,
      openHistory,
      closeHistoryModal
    };
  }
};
</script>

<style>
body {
  font-family: 'Tajawal', sans-serif !important;
}

div {
  background-color: #343a40 !important;
}

.btn-action {
  width: 120px;
  height: 60px;
  vertical-align: middle;
}

.btn-new-game {
  width: 100px;
  height: 40px;
  vertical-align: middle;
}

.popover,
.popover-body {
  background-color: white !important;
}

.btn-close {
  color: white;
  border: none;
  background: none;
}

.badge {
  vertical-align: middle;
  width: 40px;
}

td,
th {
  padding-left: 1px !important;
  padding-right: 1px !important;
  margin: 0;
}

.my-container {
  position: relative;
  min-height: 99.9vh;
}

.content-wrap {
  padding-bottom: 1rem;
}

.my-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 2rem;
  text-align: center;
  vertical-align: middle;
  background-color: inherit;
  color: white;
}

.noselect {
  user-select: none;
}
</style>
