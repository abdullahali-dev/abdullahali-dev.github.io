<template>
  <table class="table text-center table-dark">
    <thead>
      <tr>
        <th scope="col" colspan="2" class="px-2">
          {{ t('losers.title') }}
        </th>
      </tr>
      <tr>
        <th scope="col">{{ t('players.name') }}</th>
        <th scope="col">{{ t('players.score') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="player in loserPlayers" :key="player.ID">
        <td>{{ player.Name }}</td>
        <td>{{ player.Score }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  props: {
    loserPlayers: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>
