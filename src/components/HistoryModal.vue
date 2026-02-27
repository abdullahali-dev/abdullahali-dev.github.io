<template>
  <div class="modal fade show" id="HistoryModal" style="display: block" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content bg-dark text-white border-white" dir="rtl">
        <div class="modal-header bg-dark text-white border-white d-flex justify-content-between align-items-center">
          <h4 class="modal-title mb-0">{{ t('modal.history.title') }}</h4>
        </div>
        <div class="modal-body p-0">
          <div v-if="formattedEvents.length === 0" class="text-center p-4">
            <p>{{ t('modal.history.noEvents') }}</p>
          </div>
          <div v-else>
            <div
              v-for="(event, index) in formattedEvents"
              :key="event.id"
              class="border-bottom event-item"
            >
              <div
                class="p-3 d-flex justify-content-between align-items-start cursor-pointer event-header"
                style="background-color: #495057"
                @click="toggleExpanded(event.id)"
              >
                <div class="flex-grow-1 mr-2">
                  <div class="mb-2">
                    <strong style="font-size: 1.05rem">
                      {{ event.actionKey ? t(`actions.${event.actionKey}`) : event.actionName }}
                    </strong>
                  </div>
                  <small class="badge badge-info mt-2">{{ event.displayTime }}</small>
                </div>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-light flex-shrink-0 expand-btn"
                  :class="{ collapsed: !isExpanded(event.id) }"
                >
                  {{ isExpanded(event.id) ? '▼' : '▶' }}
                </button>
              </div>
              <div v-if="isExpanded(event.id)" class="p-3" style="background-color: #343a40">
                <h6 class="mb-3">{{ t('modal.history.details') }}</h6>
                <div class="table-responsive">
                  <table class="table table-sm table-dark mb-0">
                    <thead>
                      <tr>
                        <th style="font-size: 0.9rem">{{ t('players.name') }}</th>
                        <th style="font-size: 0.9rem">{{ t('modal.history.before') }}</th>
                        <th style="font-size: 0.9rem">{{ t('modal.history.after') }}</th>
                        <th style="font-size: 0.9rem">{{ t('modal.history.change') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="change in event.playerChanges"
                        :key="change.playerId"
                        :class="getRowClass(change)"
                      >
                        <td>{{ change.playerName }}</td>
                        <td>{{ change.scoreBefore }}</td>
                        <td>{{ change.scoreAfter }}</td>
                        <td :class="getScoreChangeClass(change.scoreChange)">
                          <strong>{{ change.scoreChange >= 0 ? '+' : '' }}{{ change.scoreChange }}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            style="width: 100px"
            @click="closeModal"
          >
            {{ t('modal.history.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { historyUtils } from '../historyUtils';

export default {
  props: {
    events: {
      type: Array,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const expandedIds = ref(new Set());

    const formattedEvents = computed(() => {
      return props.events.map((event) => historyUtils.formatEvent(event));
    });

    const translateSummary = (summary) => {
      if (summary === 'noChanges') {
        return t('modal.history.noChanges');
      }
      // Translate "added" and "removed" keys in the summary
      let translated = summary.replace(/ added/g, ` ${t('modal.history.added')}`);
      translated = translated.replace(/ removed/g, ` ${t('modal.history.removed')}`);
      return translated;
    };

    const toggleExpanded = (id) => {
      const newSet = new Set(expandedIds.value);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      expandedIds.value = newSet;
    };

    const isExpanded = (id) => {
      return expandedIds.value.has(id);
    };

    const getRowClass = (change) => {
      if (change.type === 'added') return 'table-success';
      if (change.type === 'removed') return 'table-danger';
      return '';
    };

    const getScoreChangeClass = (scoreChange) => {
      if (scoreChange > 0) return 'text-danger'; // More points = worse for player
      if (scoreChange < 0) return 'text-success'; // Negative points = good for player
      return '';
    };

    const closeModal = () => {
      emit('close');
    };

    return {
      t,
      formattedEvents,
      expandedIds,
      toggleExpanded,
      isExpanded,
      getRowClass,
      getScoreChangeClass,
      translateSummary,
      closeModal
    };
  }
};
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.cursor-pointer:hover {
  background-color: #5a6268 !important;
  transition: background-color 0.2s;
}

.event-item {
  margin-bottom: 0;
}

.event-header {
  cursor: pointer;
  transition: background-color 0.2s;
}

.event-header:hover {
  background-color: #5a6268 !important;
}

.expand-btn {
  min-width: 36px;
  margin-left: 10px;
}

.expand-btn .collapsed {
  transform: rotate(-90deg);
  transition: transform 0.2s;
}

.table-responsive {
  overflow-x: auto;
}

.modal-header {
  padding: 1.2rem;
}

.modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.table {
  margin-bottom: 0;
}

.badge {
  white-space: nowrap;
}
</style>
