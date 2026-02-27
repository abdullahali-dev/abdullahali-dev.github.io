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
              لعبة جديدة
            </button>
            <h4 class="noselect m-0 p-0 mt-2" id="title" style="user-select: none">نشرة كنكان</h4>
          </div>
        </div>
        <div class="card-body p-2" dir="rtl">
          <!-- Max Score Display -->
          <div v-if="gameInfo" class="text-center text-white-50" role="alert">
            <strong>الحد الأعلى للنقاط: {{ gameInfo.maxScore }}</strong>
          </div>

          <div class="m-2 justify-content-center">
            <div class="col-12 text-center">
              <button class="btn btn-success btn-action m-1" @click="initAction('Hand')">
                هند
              </button>
              <button class="btn btn-warning btn-action m-1" @click="initAction('SuperHand')">
                سوبر هند
              </button>
              <button class="btn btn-danger btn-action m-1" @click="initAction('FullHand')">
                فل هند
              </button>
              <button class="btn btn-primary btn-action m-1" @click="initAction('Finished')">
                خالص
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
                تراجع
              </button>
              <button
                id="BtnRedo"
                class="btn btn-outline-success"
                style="width: 110px; margin: 4px"
                @click="redo"
                :disabled="!canRedo"
                type="button"
              >
                إعادة
              </button>
              <button
                id="BtnHistory"
                class="btn btn-outline-info"
                style="width: 110px; margin: 4px"
                @click="openHistory"
                type="button"
              >
                السجل
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
    const gameInfo = ref(null);
    const playerNameInput = ref('');
    const showScoreModal = ref(false);
    const currentActionType = ref('');
    const showHistoryModal = ref(false);
    const events = ref([]);
    const historyPosition = ref(0);

    const activePlayers = computed(() => {
      return gameInfo.value ? gameUtils.getSortedActivePlayers(gameInfo.value) : [];
    });

    const loserPlayers = computed(() => {
      return gameInfo.value ? gameUtils.getLoserPlayers(gameInfo.value) : [];
    });

    const canUndo = computed(() => historyPosition.value > 0);

    const canRedo = computed(() => historyPosition.value < events.value.length);

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
        historyPosition.value = events.value.length;
      }
    };

    const openNewGameDialog = () => {
      const maxScore = window.prompt('الحد الأعلى للنقاط');
      if (maxScore === null) return;

      if (!maxScore.match('^[0-9]+$')) {
        alert('يجب ادخال رقم صحيح');
        return;
      }

      const existingPlayers = gameInfo.value ? gameInfo.value.players : [];
      const newGameInfo = gameUtils.createNewGame(maxScore, existingPlayers);
      gameInfo.value = newGameInfo;
      
      // Reset history for new game
      events.value = [];
      historyPosition.value = 0;
      historyUtils.saveHistory(newGameInfo.gameId, []);
    };

    const addEvent = (type, actionName, beforeState, playerChanges) => {
      // Only keep events up to current position (discard the redo stack)
      events.value = events.value.slice(0, historyPosition.value);
      
      const event = historyUtils.createEvent(
        type,
        actionName,
        beforeState,
        gameInfo.value,
        playerChanges
      );
      
      events.value.push(event);
      historyPosition.value = events.value.length;
      
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

      gameUtils.addPlayer(gameInfo.value, playerNameInput.value);
      playerNameInput.value = '';
      gameInfo.value = { ...gameInfo.value };
    };

    const handleAddPlayerEvent = (playerName) => {
      if (!gameInfo.value) {
        alert('قم بإنشاء لعبة جديدة أولاً');
        return;
      }

      gameUtils.addPlayer(gameInfo.value, playerName);
      gameInfo.value = { ...gameInfo.value };
    };

    const removePlayer = (playerId) => {
      if (!confirm('هل انت متأكد ؟')) return;

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
      
      addEvent('remove_player', `حذف اللاعب: ${removedPlayer.Name}`, beforeState, playerChanges);
    };

    const initAction = (actionType) => {
      if (!gameInfo.value) {
        alert('قم بإنشاء لعبة جديدة أولاً');
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
      addEvent('score_update', currentActionType.value, beforeState, playerChanges);

      gameInfo.value = { ...gameInfo.value };
      showScoreModal.value = false;
    };

    const closeScoreModal = () => {
      showScoreModal.value = false;
    };

    const undo = () => {
      if (!canUndo.value) return;
      
      historyPosition.value--;
      const previousEvent = events.value[historyPosition.value - 1];
      
      if (previousEvent) {
        gameInfo.value = JSON.parse(JSON.stringify(previousEvent.afterState));
      } else {
        gameInfo.value = JSON.parse(JSON.stringify(events.value[0]?.beforeState));
      }
    };

    const redo = () => {
      if (!canRedo.value) return;
      
      const event = events.value[historyPosition.value];
      if (event) {
        gameInfo.value = JSON.parse(JSON.stringify(event.afterState));
        historyPosition.value++;
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
      openNewGameDialog,
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
