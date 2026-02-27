<template>
  <table class="table text-center table-dark">
    <thead>
      <tr>
        <th scope="col" colspan="4">
          <div class="d-flex justify-content-between align-items-center">
            <input v-model="localPlayerInput" type="text" class="form-control text-right mx-1"
              :placeholder="t('players.addPlayer')" maxlength="15" @keyup.enter="handleAddPlayer" />
              <button class="btn btn-primary mx-1" @click="handleAddPlayer" type="button">
                {{ t('players.addButton') }}
              </button>
          </div>
        </th>
      </tr>
      <tr>
        <th scope="col" class="ps-1">{{ t('players.rank') }}</th>
        <th scope="col" class="text-end">{{ t('players.name') }}</th>
        <th scope="col">{{ t('players.score') }}</th>
        <th scope="col"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(player, index) in activePlayers" :key="player.ID" :id="player.ID">
        <td class="text-end pe-5">
          {{ index + 1 }}
          <span v-if="index === activePlayers.length - 1" class="badge bg-warning text-dark p-0" style="line-height: 1.5;">
            {{ `${t('players.distributing')}` }}</span>
          <span v-else-if="index === activePlayers.length - 2" class="badge bg-warning text-dark p-0" style="line-height: 1.5;">
            {{ `${t('players.dealing')}` }}</span>
          <!-- <span v-else> </span> -->
        </td>
        <td :class="{ 'text-success font-weight-bold': isFirstPlayerToScore(player) }" class="text-end">
          {{ player.Name }}
        </td>
        <td>{{ player.Score }}</td>
        <td class="d-flex justify-content-between" style="direction: ltr">
          <div class="bg-transparent">
            <a class="text-decoration-none px-2 text-danger" style="cursor: pointer;"
              @click="handleRemovePlayer(player.ID)">
              x
            </a>
            <a class="text-decoration-none px-2 text-success" style="cursor: pointer;"
              @click="handleAddPoints(player.ID, player.Name)" title="إضافة نقاط">
              +
            </a>
            <a class="text-decoration-none px-2 text-warning" style="cursor: pointer;"
              @click="handleSubtractPoints(player.ID, player.Name)" title="خصم نقاط">
              −
            </a>
          </div>
          <span v-if="
            activePlayers.length > 1 &&
            activePlayers.filter((x) => x.Score !== 0).length > 0
          ">
            <!-- <span
              v-if="index === activePlayers.length - 2"
              class="badge badge-warning float-right"
              style="vertical-align: middle"
            >
              {{ t('players.dealing') }}
            </span>
            <span
              v-if="index === activePlayers.length - 1"
              class="badge badge-warning float-right"
              style="vertical-align: middle"
            >
              {{ t('players.distributing') }}
            </span> -->
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { gameUtils } from '../gameUtils';

export default {
  props: {
    gameInfo: {
      type: Object,
      required: true
    },
    playerNameInput: {
      type: String,
      default: ''
    }
  },
  emits: ['add-player', 'remove-player', 'add-points', 'subtract-points'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const localPlayerInput = ref(props.playerNameInput);

    const activePlayers = computed(() => {
      return gameUtils.getSortedActivePlayers(props.gameInfo);
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

    const handleAddPlayer = () => {
      if (localPlayerInput.value.trim()) {
        emit('add-player', localPlayerInput.value);
        localPlayerInput.value = '';
      }
    };

    const handleRemovePlayer = (playerId) => {
      emit('remove-player', playerId);
    };

    const handleAddPoints = (playerId, playerName) => {
      emit('add-points', { playerId, playerName });
    };

    const handleSubtractPoints = (playerId, playerName) => {
      emit('subtract-points', { playerId, playerName });
    };

    return {
      t,
      localPlayerInput,
      activePlayers,
      isFirstPlayerToScore,
      handleAddPlayer,
      handleRemovePlayer,
      handleAddPoints,
      handleSubtractPoints
    };
  }
};
</script>

<style scoped>
input {
  border-color: #ced4da;
}
</style>
