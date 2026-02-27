<template>
  <table class="table text-center table-dark">
    <thead>
      <tr>
        <th scope="col" colspan="2" class="px-2">
          الخاسرون
        </th>
      </tr>
      <tr>
        <th scope="col">الاسم</th>
        <th scope="col">النقاط</th>
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
export default {
  props: {
    loserPlayers: {
      type: Array,
      required: true
    }
  }
};
</script>
