<template>
  <table class="table text-center table-dark">
    <thead>
      <tr>
        <th scope="col" colspan="3" class="px-2">
          <input
            v-model="localPlayerInput"
            type="text"
            class="form-control text-right"
            placeholder="اسم لاعب"
            maxlength="10"
            @keyup.enter="handleAddPlayer"
          />
        </th>
        <th scope="col">
          <button class="btn btn-primary" @click="handleAddPlayer" type="button">
            اضافة
          </button>
        </th>
      </tr>
      <tr>
        <th scope="col">الترتيب</th>
        <th scope="col">الاسم</th>
        <th scope="col">النقاط</th>
        <th scope="col"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(player, index) in activePlayers" :key="player.ID" :id="player.ID">
        <td>{{ index + 1 }}</td>
        <td :class="{ 'text-success font-weight-bold': isFirstPlayerToScore(player) }">
          {{ player.Name }}
        </td>
        <td>{{ player.Score }}</td>
        <td class="d-flex justify-content-between align-items-center" style="direction: ltr">
          <a
            class="text-decoration-none px-3 text-danger float-left d-inline"
            style="margin-left: 2px"
            @click="handleRemovePlayer(player.ID)"
          >
            X
        </a>
          <span
            v-if="
              activePlayers.length > 1 &&
              activePlayers.filter((x) => x.Score !== 0).length > 0
            "
          >
            <span
              v-if="index === activePlayers.length - 2"
              class="badge badge-warning float-right"
              style="vertical-align: middle"
            >
              يجرش
            </span>
            <span
              v-if="index === activePlayers.length - 1"
              class="badge badge-warning float-right"
              style="vertical-align: middle"
            >
              يوزع
            </span>
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { ref, computed } from 'vue';
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
  emits: ['add-player', 'remove-player'],
  setup(props, { emit }) {
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

    return {
      localPlayerInput,
      activePlayers,
      isFirstPlayerToScore,
      handleAddPlayer,
      handleRemovePlayer
    };
  }
};
</script>

<style scoped>
input {
  border-color: #ced4da;
}
</style>
