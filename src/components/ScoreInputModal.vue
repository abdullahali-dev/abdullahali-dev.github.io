<template>
  <div class="modal fade show" id="PlayersInputModal" style="display: block" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content bg-dark text-white border-white p-1" dir="rtl">
        <div class="modal-header bg-dark text-white border-white d-flex justify-content-between">
            <h4 class="modal-title">{{ t('modal.scoreInput.title') }}</h4>
            <button
            class="btn btn-sm btn-outline-warning float-left"
            type="button"
            @click="reinitAction"
            >
            {{ t('modal.scoreInput.clear') }}
        </button>
        </div>
        <div class="modal-body p-1">
          <table class="table text-center table-dark">
            <thead>
              <tr>
                <th scope="col">{{ t('players.name') }}</th>
                <th scope="col">{{ t('players.score') }}</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in activePlayers" :key="player.ID">
                <td :class="{ 'text-success font-weight-bold': isFirstPlayerToScore(player) }">{{ player.Name }}</td>
                <td>
                  <input
                    :id="'input-box-' + player.ID"
                    v-model.number="scores[player.ID]"
                    type="tel"
                    class="form-control text-center p-0"
                    placeholder="0"
                    maxlength="4"
                    @click="clearInput('input-box-' + player.ID)"
                  />
                </td>
                <td style="position: relative">
                  <button
                    v-if="actionDetails.isHandType"
                    :id="'plus-btn-' + player.ID"
                    class="btn btn-primary mx-1 plus-btn"
                    :class="{ 'btn-secondary': plusBtnDisabled[player.ID] }"
                    :disabled="plusBtnDisabled[player.ID]"
                    @click="addBonus(player.ID)"
                  >
                    +{{ 50 * actionDetails.multipleBy }}
                  </button>
                  <button
                    :id="'action-btn-' + player.ID"
                    class="btn btn-success action-btn mx-1"
                    :class="{ 'btn-secondary': actionBtnDisabled[player.ID] }"
                    :disabled="actionBtnDisabled[player.ID]"
                    @click="setWinnerScore(player.ID)"
                  >
                    {{ t(`actions.${actionDetails.actionKey}`) }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer justify-content-between">
          <button
            type="button"
            class="btn btn-secondary"
            style="width: 100px"
            @click="closeModal"
          >
            {{ t('modal.scoreInput.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            style="width: 100px"
            @click="confirmScores"
          >
            {{ t('modal.scoreInput.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { gameUtils } from '../gameUtils';

export default {
  props: {
    activePlayers: {
      type: Array,
      required: true
    },
    actionType: {
      type: String,
      required: true
    },
    gameInfo: {
      type: Object,
      required: true
    }
  },
  emits: ['update:scores', 'close'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const scores = ref({});
    const plusBtnDisabled = ref({});
    const actionBtnDisabled = ref({});

    const actionDetails = computed(() => {
      return gameUtils.getActionDetails(props.actionType);
    });

    const initialActionScore = computed(() => {
      return gameUtils.calculateActionScore(props.actionType);
    });

    const isNotFirstGame = computed(() => {
      return gameUtils.isNotFirstGame(props.gameInfo);
    });

    const lowestScorePlayer = computed(() => {
      return gameUtils.getLowestScorePlayer(props.gameInfo);
    });

    const isFirstPlayerToScore = (player) => {
      if (!isNotFirstGame.value) return false;
      return lowestScorePlayer.value && lowestScorePlayer.value.ID === player.ID;
    };

    const initializeScores = () => {
      scores.value = {};
      plusBtnDisabled.value = {};
      actionBtnDisabled.value = {};

      props.activePlayers.forEach((player) => {
        scores.value[player.ID] = initialActionScore.value;
        plusBtnDisabled.value[player.ID] = false;
        actionBtnDisabled.value[player.ID] = false;
      });
    };

    const clearInput = (inputId) => {
      const playerId = parseInt(inputId.replace('input-box-', ''));
      scores.value[playerId] = '';
    };

    const addBonus = (playerId) => {
      const bonus = 50 * actionDetails.value.multipleBy;
      const currentVal = Number.isInteger(scores.value[playerId])
        ? scores.value[playerId]
        : 0;
      scores.value[playerId] = currentVal + bonus;

      // Disable all plus buttons
      Object.keys(plusBtnDisabled.value).forEach((id) => {
        plusBtnDisabled.value[id] = true;
      });
    };

    const setWinnerScore = (playerId) => {
      const winnerScore = actionDetails.value.winnerNum * actionDetails.value.multipleBy;
      scores.value[playerId] = winnerScore;

      // Disable plus button for this player if it exists
      if (plusBtnDisabled.value.hasOwnProperty(playerId)) {
        plusBtnDisabled.value[playerId] = true;
      }

      // Disable all action buttons
      Object.keys(actionBtnDisabled.value).forEach((id) => {
        actionBtnDisabled.value[id] = true;
      });
    };

    const confirmScores = () => {
      // Filter scores to only include valid integer values
      const validScores = {};
      Object.entries(scores.value).forEach(([playerId, score]) => {
        if (Number.isInteger(score)) {
          validScores[playerId] = score;
        }
      });

      emit('update:scores', validScores);
    };

    const closeModal = () => {
      emit('close');
    };

    const reinitAction = () => {
      initializeScores();
    };

    // Initialize scores when modal opens
    initializeScores();

    return {
      t,
      scores,
      plusBtnDisabled,
      actionBtnDisabled,
      actionDetails,
      initialActionScore,
      isFirstPlayerToScore,
      clearInput,
      addBonus,
      setWinnerScore,
      confirmScores,
      closeModal,
      reinitAction
    };
  }
};
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

input[type='tel'] {
  border-color: #ced4da !important;
}
</style>
