<template>
  <div id="app" class="my-container">
    <div class="content-wrap">
      <div class="card bg-dark text-white border-white">
        <div class="card-header border-white">
          <div class="card-title">
            <h4 class="d-inline noselect" id="title" style="user-select: none">نشرة كنكان</h4>
            <button
              id="NewGameBtn"
              class="btn btn-info btn-new-game float-left d-inline"
              @click="openNewGameDialog"
            >
              لعبة جديدة
            </button>
          </div>
        </div>
        <div class="card-body p-2" dir="rtl">
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
                style="width: 240px; margin: 4px; max-width: 100%"
                @click="undo"
                type="button"
              >
                تراجع
              </button>
            </div>
          </div>

          <!-- Players Table -->
          <PlayersTable
            v-if="gameInfo"
            :gameInfo="gameInfo"
            :playerNameInput.sync="playerNameInput"
            @add-player="addPlayer"
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import PlayersTable from './components/PlayersTable.vue';
import LosersTable from './components/LosersTable.vue';
import ScoreInputModal from './components/ScoreInputModal.vue';
import { gameUtils } from './gameUtils';

export default {
  components: {
    PlayersTable,
    LosersTable,
    ScoreInputModal
  },
  setup() {
    const gameInfo = ref(null);
    const playerNameInput = ref('');
    const showScoreModal = ref(false);
    const currentActionType = ref('');

    const activePlayers = computed(() => {
      return gameInfo.value ? gameUtils.getSortedActivePlayers(gameInfo.value) : [];
    });

    const loserPlayers = computed(() => {
      return gameInfo.value ? gameUtils.getLoserPlayers(gameInfo.value) : [];
    });

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
      gameUtils.backupGameInfo(gameInfo.value || {});
      gameInfo.value = gameUtils.createNewGame(maxScore, existingPlayers);
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

    const removePlayer = (playerId) => {
      if (!confirm('هل انت متأكد ؟')) return;

      gameUtils.backupGameInfo(gameInfo.value);
      gameUtils.removePlayer(gameInfo.value, playerId);
      gameInfo.value = { ...gameInfo.value };
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
      gameUtils.backupGameInfo(gameInfo.value);

      Object.entries(scores).forEach(([playerId, score]) => {
        if (Number.isInteger(score)) {
          gameUtils.updatePlayerScore(gameInfo.value, parseInt(playerId), score);
        }
      });

      gameInfo.value = { ...gameInfo.value };
      showScoreModal.value = false;
    };

    const closeScoreModal = () => {
      showScoreModal.value = false;
    };

    const undo = () => {
      const backup = gameUtils.loadGameBackup();
      if (backup && backup.players) {
        gameInfo.value = backup;
      }
    };

    return {
      gameInfo,
      playerNameInput,
      showScoreModal,
      currentActionType,
      activePlayers,
      loserPlayers,
      openNewGameDialog,
      addPlayer,
      removePlayer,
      initAction,
      updateScores,
      closeScoreModal,
      undo
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
